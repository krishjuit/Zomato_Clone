import notificationModel from "../models/notificationModel.js";

// Get Notifications List
export const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const notifications = await notificationModel
      .find({ user: userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark Single Notification as Read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await notificationModel.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (notification.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to access this notification",
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark Read Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark All Notifications as Read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;

    await notificationModel.updateMany({ user: userId, isRead: false }, { isRead: true });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark All Read Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
