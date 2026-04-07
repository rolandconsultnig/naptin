package com.owltalk.ui.auth

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.owltalk.MainActivity
import com.owltalk.api.ApiClient
import com.owltalk.ui.config.ConfigActivity
import com.owltalk.utils.ConfigManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import android.widget.EditText
import android.widget.Button
import android.widget.ProgressBar
import android.view.View
import androidx.appcompat.widget.Toolbar

class LoginActivity : AppCompatActivity() {
    
    private lateinit var etUsername: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnLogin: Button
    private lateinit var progressBar: ProgressBar
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize API client with context
        ApiClient.initialize(this)
        
        // Create simple layout programmatically
        val layout = android.widget.LinearLayout(this).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setPadding(80, 80, 80, 80)
        }
        
        // Title
        val title = android.widget.TextView(this).apply {
            text = "OwlTalk"
            textSize = 32f
            gravity = android.view.Gravity.CENTER
            setPadding(0, 40, 0, 60)
        }
        
        // Subtitle
        val subtitle = android.widget.TextView(this).apply {
            text = "Connect with friends"
            textSize = 18f
            gravity = android.view.Gravity.CENTER
            setTextColor(android.graphics.Color.GRAY)
            setPadding(0, 0, 0, 60)
        }
        
        // Username input
        etUsername = EditText(this).apply {
            hint = "Username"
            minHeight = 120
            setPadding(30, 30, 30, 30)
            textSize = 18f
        }
        
        // Password input
        etPassword = EditText(this).apply {
            hint = "Password"
            inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
            minHeight = 120
            setPadding(30, 30, 30, 30)
            textSize = 18f
        }
        
        // Progress bar
        progressBar = ProgressBar(this).apply {
            visibility = View.GONE
        }
        
        // Config button
        val btnConfig = Button(this).apply {
            text = "⚙️ Config"
            minHeight = 60
            setTextSize(android.util.TypedValue.COMPLEX_UNIT_SP, 14f)
            setOnClickListener { 
                startActivity(Intent(this@LoginActivity, ConfigActivity::class.java))
            }
        }
        
        // Login button
        btnLogin = Button(this).apply {
            text = "Login"
            minHeight = 120
            setTextSize(android.util.TypedValue.COMPLEX_UNIT_SP, 18f)
            setOnClickListener { login() }
        }
        
        layout.addView(title)
        layout.addView(subtitle)
        layout.addView(etUsername)
        layout.addView(etPassword)
        layout.addView(progressBar)
        layout.addView(btnLogin)
        layout.addView(btnConfig)
        
        setContentView(layout)
    }
    
    private fun login() {
        val username = etUsername.text.toString().trim()
        val password = etPassword.text.toString().trim()
        
        if (username.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Please enter username and password", Toast.LENGTH_SHORT).show()
            return
        }
        
        showProgress(true)
        
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val response = ApiClient.api.login(com.owltalk.models.LoginRequest(username, password))
                
                if (response.isSuccessful && response.body() != null) {
                    val user = response.body()?.user
                    if (user != null) {
                        // Login successful
                        Toast.makeText(this@LoginActivity, "Login successful!", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this@LoginActivity, MainActivity::class.java))
                        finish()
                    } else {
                        Toast.makeText(this@LoginActivity, "Invalid credentials", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Toast.makeText(this@LoginActivity, "Login failed: ${response.message()}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@LoginActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                showProgress(false)
            }
        }
    }
    
    private fun showProgress(show: Boolean) {
        progressBar.visibility = if (show) View.VISIBLE else View.GONE
        btnLogin.isEnabled = !show
    }
}

