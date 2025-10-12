import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Enquiry } from '../shared/interface/enquiry';
import { EnquiriesService } from '../enquiries/enquiries.service';
import { WebSocketNotification, Notification } from '../shared/interface/notification';
import { SocketNotificationType } from '../shared/enums/notification';
import { ActivitiesService } from '../activities/activities.service';
import { Activity } from '../shared/interface/activities';
import { NotificationsService } from '../user/notifications/notifications.service';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: Socket;
  
  constructor(
    private enquiry: EnquiriesService,
    private activities: ActivitiesService,
    private notificationService: NotificationsService
  ) {}

  connect(token?: string): void {
    if (!token) {
      console.error('WebSocket: No user token provided!');
      return;
    }

    // Connect using Socket.IO
    this.socket = io(environment.api.webSocketUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Socket.IO disconnected:', reason);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket.IO connection error:', error);
    });

    // Listen for server notifications
    this.socket.on('notification', (data: WebSocketNotification) => {
      this.handleNotification(data);
    });
  }

  send(type: string, payload: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('notification', { type, payload });
    } else {
      console.error('Socket.IO is not connected.');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private handleNotification(notification: WebSocketNotification): void {
    console.log('handleNotification', notification.type);

    switch (notification.type) {
      case SocketNotificationType.Activity:
        this.activities.insertActivities(notification.payload as Activity);
        break;

      case SocketNotificationType.Enquiry:
        this.enquiry.insertEnquiryToState(notification.payload as Enquiry);
        break;

      case SocketNotificationType.User:
        this.notificationService.insertNotificationToState(
          notification.payload as Notification
        );
        break;

      default:
        console.error('Unknown Notification type', notification.type);
        break;
    }
  }
}
