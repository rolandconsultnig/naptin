package com.owltalk

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Create simple layout programmatically
        val layout = android.widget.LinearLayout(this).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setPadding(40, 40, 40, 40)
        }
        
        val title = TextView(this).apply {
            text = "Welcome to OwlTalk!"
            textSize = 28f
            setPadding(0, 60, 0, 20)
        }
        
        val subtitle = TextView(this).apply {
            text = "Chat List\n(To be implemented)"
            textSize = 18f
            setTextColor(android.graphics.Color.GRAY)
            setPadding(0, 0, 0, 20)
        }
        
        val info = TextView(this).apply {
            text = "Android app is running!\n\nNext steps:\n1. Implement chat UI\n2. Add Socket.IO client\n3. Implement WebRTC\n4. Add media sharing"
            textSize = 16f
            setPadding(0, 40, 0, 0)
        }
        
        layout.addView(title)
        layout.addView(subtitle)
        layout.addView(info)
        
        setContentView(layout)
    }
}

