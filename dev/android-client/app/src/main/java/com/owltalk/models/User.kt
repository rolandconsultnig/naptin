package com.owltalk.models

data class User(
    val id: Int,
    val username: String,
    val email: String,
    val status: String? = null,
    val profilePicture: String? = null,
    val isAdmin: Boolean = false,
    val lastSeen: String? = null,
    val created_at: String? = null
)

data class LoginRequest(
    val username: String,
    val password: String
)

data class RegisterRequest(
    val username: String,
    val email: String,
    val password: String
)

data class ApiResponse<T>(
    val message: String?,
    val user: T? = null,
    val error: String? = null
)

