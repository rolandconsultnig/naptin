package com.owltalk.utils

import android.content.Context
import android.content.SharedPreferences

class ConfigManager(context: Context) {
    private val prefs: SharedPreferences = 
        context.getSharedPreferences("OwlTalkConfig", Context.MODE_PRIVATE)
    
    private val KEY_IP = "server_ip"
    private val KEY_PORT = "server_port"
    private val KEY_CONFIG_SET = "config_set"
    private val CONFIG_PASSWORD = "P@55w0rD"
    
    fun saveConfig(ip: String, port: String) {
        prefs.edit().apply {
            putString(KEY_IP, ip)
            putString(KEY_PORT, port)
            putBoolean(KEY_CONFIG_SET, true)
            apply()
        }
    }
    
    fun getServerUrl(): String {
        val ip = prefs.getString(KEY_IP, "10.0.2.2") ?: "10.0.2.2"
        val port = prefs.getString(KEY_PORT, "5000") ?: "5000"
        return "http://$ip:$port/api/"
    }
    
    fun getServerHost(): String {
        val ip = prefs.getString(KEY_IP, "10.0.2.2") ?: "10.0.2.2"
        val port = prefs.getString(KEY_PORT, "5000") ?: "5000"
        return "$ip:$port"
    }
    
    fun getIp(): String = prefs.getString(KEY_IP, "10.0.2.2") ?: "10.0.2.2"
    fun getPort(): String = prefs.getString(KEY_PORT, "5000") ?: "5000"
    
    fun isConfigSet(): Boolean = prefs.getBoolean(KEY_CONFIG_SET, false)
    
    fun verifyPassword(password: String): Boolean {
        return password == CONFIG_PASSWORD
    }
}

