// ============================================================
// 配置文件 - 所有页面共享
// 修改密钥、管理员UID只需要改这一个文件
// ============================================================
var CONFIG = {
  // Supabase配置
  SUPABASE_URL: "https://ekfntkpjqzmkibdimtru.supabase.co",
  ANON_KEY: "sb_publishable_Z3wpxD9ZRbXm9-gPPQOGZg_KKhr_yIs",

  // 管理员UID白名单（两个管理员）
  ADMIN_UIDS: [
    "919f3af0-801d-4d7b-87b4-03bedc9d2896",  // 超级管理员
    "6522e17f-14ea-4f1f-b20d-10457d598fef"   // admin
  ],

  // 开发者学号
  DEV_SIDS: ["3", "12", "19"],

  // 老师邮箱
  TEACHER_EMAIL: "denglaoshi@class20207.com",

  // 页面跳转地址
  PAGES: {
    login: "index.html",
    internalLogin: "internal-login.html",
    adminLogin: "admin-login.html",
    visitor: "visitor.html",
    userHome: "a3x7k2m9p4q8r3t6w1y5u0i2o4.html",
    adminHome: "admin-main.html",
    adminSettings: "admin-settings.html",
    settings: "settings.html",
    changePassword: "change-password.html",
    message: "message.html",
    contactAdmin: "contact-admin.html",
    register: "register.html",
    about: "about.html",
    gallery: "gallery.html",
    videos: "videos.html",
    classwall: "classwall.html",
    developers: "developers.html"
  },

  // 登录保持天数
  LOGIN_KEEP_DAYS: 30
};
