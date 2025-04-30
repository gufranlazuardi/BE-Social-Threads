// src/socketServer.ts
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface User {
    userId: string;
    socketId: string;
}

class SocketService {
    private io: Server;
    private users: User[] = [];

    constructor(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: process.env.CLIENT_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });

        this.setupSocketEvents();
    }

    private setupSocketEvents(): void {
        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);

            // User connects with their ID
            socket.on('login', (userId: string) => {
                this.addUser(userId, socket.id);
                socket.emit('connected', { status: true, socketId: socket.id });
                console.log(`User ${userId} logged in with socket ${socket.id}`);
            });

            // Handle new message
            socket.on('sendMessage', async (data: {
                senderId: string,
                receiverId: string,
                content: string,
                conversationId?: string
            }) => {
                try {
                    const { senderId, receiverId, content, conversationId } = data;

                    // Find or create conversation
                    let conversation;

                    if (conversationId) {
                        conversation = await prisma.conversation.findUnique({
                            where: { id: conversationId }
                        });
                    } else {
                        // Check if conversation already exists between these users
                        const existingConversations = await prisma.conversation.findMany({
                            where: {
                                participants: {
                                    every: {
                                        userId: {
                                            in: [senderId, receiverId]
                                        }
                                    }
                                },
                                AND: [
                                    {
                                        participants: {
                                            some: {
                                                userId: senderId
                                            }
                                        }
                                    },
                                    {
                                        participants: {
                                            some: {
                                                userId: receiverId
                                            }
                                        }
                                    }
                                ]
                            },
                            include: {
                                participants: true
                            }
                        });

                        // Filter conversations with exactly 2 participants (direct messages)
                        const directConversation = existingConversations.find(
                            conv => conv.participants.length === 2
                        );

                        if (directConversation) {
                            conversation = directConversation;
                        } else {
                            // Create new conversation if none exists
                            conversation = await prisma.conversation.create({
                                data: {
                                    participants: {
                                        create: [
                                            { userId: senderId },
                                            { userId: receiverId }
                                        ]
                                    }
                                }
                            });
                        }
                    }

                    // Save message to database
                    const message = await prisma.message.create({
                        data: {
                            content,
                            senderId,
                            conversationId: conversation?.id || ''
                        },
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    username: true,
                                    name: true
                                }
                            }
                        }
                    });

                    // Send message to receiver if they're online
                    const receiver = this.getUser(receiverId);
                    if (receiver) {
                        this.io.to(receiver.socketId).emit('newMessage', message);
                    }

                    // Send success confirmation to sender
                    socket.emit('messageSent', message);

                } catch (error) {
                    console.error('Error sending message:', error);
                    socket.emit('messageError', { error: 'Failed to send message' });
                }
            });

            // Handle typing indicators
            socket.on('typing', (data: { senderId: string, receiverId: string, conversationId: string }) => {
                const receiver = this.getUser(data.receiverId);
                if (receiver) {
                    this.io.to(receiver.socketId).emit('userTyping', {
                        userId: data.senderId,
                        conversationId: data.conversationId
                    });
                }
            });

            // Handle stop typing
            socket.on('stopTyping', (data: { senderId: string, receiverId: string, conversationId: string }) => {
                const receiver = this.getUser(data.receiverId);
                if (receiver) {
                    this.io.to(receiver.socketId).emit('userStopTyping', {
                        userId: data.senderId,
                        conversationId: data.conversationId
                    });
                }
            });

            // Mark messages as read
            socket.on('markAsRead', async (data: { userId: string, conversationId: string }) => {
                try {
                    await prisma.message.updateMany({
                        where: {
                            conversationId: data.conversationId,
                            senderId: { not: data.userId },
                            read: false
                        },
                        data: { read: true }
                    });

                    // Notify other participants in the conversation
                    const conversation = await prisma.conversation.findUnique({
                        where: { id: data.conversationId },
                        include: { participants: true }
                    });

                    if (conversation) {
                        conversation.participants.forEach(participant => {
                            if (participant.userId !== data.userId) {
                                const user = this.getUser(participant.userId);
                                if (user) {
                                    this.io.to(user.socketId).emit('messagesRead', {
                                        conversationId: data.conversationId,
                                        readBy: data.userId
                                    });
                                }
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error marking messages as read:', error);
                }
            });

            // Handle disconnect
            socket.on('disconnect', () => {
                this.removeUser(socket.id);
                console.log(`User disconnected: ${socket.id}`);
            });
        });
    }

    private addUser(userId: string, socketId: string): void {
        // Remove user if they're already in the list (with different socket)
        this.users = this.users.filter(user => user.userId !== userId);

        // Add user with new socket id
        this.users.push({ userId, socketId });
    }

    private removeUser(socketId: string): void {
        this.users = this.users.filter(user => user.socketId !== socketId);
    }

    private getUser(userId: string): User | undefined {
        return this.users.find(user => user.userId === userId);
    }
}

export default SocketService;