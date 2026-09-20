package com.yupi.springbootinit.model.dto.user;

import java.io.Serializable;
import lombok.Data;

/**
 * 用户更新请求
 *
 *@author <a href="https://github.com/coolsuperou">每天十点睡</a>
 *  
 */
@Data
public class UserUpdateRequest implements Serializable {
    /**
     * id
     */
    private Long id;

    /**
     * 用户昵称
     */
    private String userName;

    /**
     * 用户头像
     */
    private String userAvatar;

    /**
     * 简介
     */
    private String userProfile;

    /**
     * 用户角色：user/admin/ban
     */
    private String userRole;

    /**
     * 用户账号（支持修改）
     */
    private String userAccount;

    /**
     * 用户密码（明文，支持修改）
     */
    private String userPassword;

    /**
     * 用户状态（active-活跃, inactive-禁用）
     */
    private String userStatus;

    /**
     * 页面访问权限（JSON字符串）
     */
    private String pagePermissions;

    private static final long serialVersionUID = 1L;
}
