package com.owltalk.api

import android.content.Context
import com.owltalk.models.*
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

interface ApiService {
    @POST("register")
    suspend fun register(@Body request: RegisterRequest): Response<ApiResponse<User>>
    
    @POST("login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<User>>
    
    @POST("logout")
    suspend fun logout(): Response<ApiResponse<User>>
    
    @GET("me")
    suspend fun getCurrentUser(): Response<ApiResponse<User>>
    
    @GET("users")
    suspend fun getUsers(): Response<List<User>>
}

object ApiClient {
    private var context: Context? = null
    
    fun initialize(appContext: Context) {
        context = appContext
    }
    
    private fun getBaseUrl(): String {
        context?.let {
            val configManager = com.owltalk.utils.ConfigManager(it)
            return configManager.getServerUrl()
        }
        return "http://10.0.2.2:5000/api/"
    }
    
    val api: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(getBaseUrl())
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}

