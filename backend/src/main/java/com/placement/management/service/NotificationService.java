package com.placement.management.service;

import com.placement.management.entity.Notification;
import com.placement.management.entity.User;
import com.placement.management.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    Notification sendNotification(User user, String title, String message, NotificationType type);
    Page<Notification> getUserNotifications(Long userId, Pageable pageable);
    List<Notification> getRecentNotifications(Long userId);
    long getUnreadCount(Long userId);
    void markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
}
