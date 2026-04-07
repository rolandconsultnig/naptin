# OwlTalk Android Client - Implementation Guide 🦉

Complete implementation guide for the OwlTalk Android application.

## 📦 Project Overview

### Architecture Pattern
- **MVVM (Model-View-ViewModel)**
- **Repository Pattern** for data management
- **Dependency Injection** via Hilt/Koin
- **Coroutines & Flow** for async operations

### Tech Stack

| Component | Technology |
|-----------|------------|
| Language | Kotlin |
| UI Framework | XML Layouts + Jetpack Compose |
| Networking | Retrofit + OkHttp |
| WebSocket | Socket.IO Client |
| WebRTC | Google WebRTC |
| Image Loading | Glide |
| Dependency Injection | Hilt |
| Navigation | Navigation Component |
| Architecture | MVVM + Repository |
| Reactive Streams | Kotlin Flow |

---

## 📁 Project Structure

```
app/src/main/
├── java/com/owltalk/
│   ├── data/
│   │   ├── api/              # Retrofit interfaces
│   │   ├── models/           # Data models
│   │   ├── local/            # Local database (Room)
│   │   └── remote/           # Remote data sources
│   ├── domain/
│   │   ├── usecases/          # Business logic
│   │   └── repository/       # Repository interfaces
│   ├── presentation/
│   │   ├── ui/
│   │   │   ├── auth/         # Login/Register
│   │   │   ├── chat/         # Chat screens
│   │   │   ├── call/         # Call screens
│   │   │   └── profile/      # Profile screens
│   │   ├── viewmodel/        # ViewModels
│   │   └── binding/          # Data binding
│   ├── di/                   # Dependency Injection
│   ├── utils/                # Utilities
│   └── webrtc/               # WebRTC implementation
├── res/
│   ├── layout/               # XML layouts
│   ├── drawable/             # Icons, images
│   ├── values/               # Strings, colors, styles
│   └── xml/                  # Configs (file providers)
└── AndroidManifest.xml
```

---

## 🔧 Core Components

### 1. API Client (`data/api/`)

#### Retrofit Configuration
```kotlin
// ApiClient.kt
object ApiClient {
    private const val BASE_URL = "http://YOUR_SERVER:5000/api/"
    
    val api: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .client(createOkHttpClient())
            .build()
            .create(ApiService::class.java)
    }
    
    private fun createOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            })
            .addInterceptor { chain ->
                val requestBuilder = chain.request().newBuilder()
                    .addHeader("Cookie", sessionCookie)
                    .build()
                chain.proceed(requestBuilder)
            }
            .build()
    }
    
    var sessionCookie: String = ""
}
```

#### API Service Interface
```kotlin
// ApiService.kt
interface ApiService {
    @POST("register")
    suspend fun register(@Body request: RegisterRequest): Response<UserResponse>
    
    @POST("login")
    suspend fun login(@Body request: LoginRequest): Response<UserResponse>
    
    @POST("logout")
    suspend fun logout(): Response<MessageResponse>
    
    @GET("me")
    suspend fun getCurrentUser(): Response<UserResponse>
    
    @GET("users")
    suspend fun getUsers(): Response<List<User>>
    
    @GET("messages/{userId}")
    suspend fun getMessages(@Path("userId") userId: Int): Response<List<Message>>
    
    @POST("messages")
    suspend fun sendMessage(@Body message: SendMessageRequest): Response<Message>
    
    @Multipart
    @POST("upload")
    suspend fun uploadFile(
        @Part file: MultipartBody.Part
    ): Response<UploadResponse>
}
```

### 2. Data Models (`data/models/`)

```kotlin
// User.kt
data class User(
    val id: Int,
    val username: String,
    val email: String,
    val status: String, // online, offline
    val profilePicture: String?,
    val isAdmin: Boolean = false,
    val lastSeen: String?
)

// Message.kt
data class Message(
    val id: Int,
    val senderId: Int,
    val receiverId: Int,
    val content: String,
    val timestamp: String,
    val isRead: Boolean,
    val isDeleted: Boolean,
    val filePath: String?,
    val messageType: String // text, image, video, audio
)

// CallRequest.kt
data class CallRequest(
    val callerId: Int,
    val receiverId: Int,
    val callType: String, // voice, video
    val timestamp: Long
)
```

### 3. ViewModels (`presentation/viewmodel/`)

```kotlin
// AuthViewModel.kt
class AuthViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _loginState = MutableStateFlow<AuthState>(AuthState.Idle)
    val loginState: StateFlow<AuthState> = _loginState.asStateFlow()
    
    fun login(username: String, password: String) {
        viewModelScope.launch {
            _loginState.value = AuthState.Loading
            try {
                val response = authRepository.login(username, password)
                if (response.isSuccessful) {
                    _loginState.value = AuthState.Success(response.body()?.user)
                } else {
                    _loginState.value = AuthState.Error(response.message())
                }
            } catch (e: Exception) {
                _loginState.value = AuthState.Error(e.message ?: "Unknown error")
            }
        }
    }
}

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Success(val user: User?) : AuthState()
    data class Error(val message: String) : AuthState()
}
```

### 4. WebSocket Client (`websocket/`)

```kotlin
// SocketManager.kt
object SocketManager {
    private var socket: Socket? = null
    private const val SERVER_URL = "http://YOUR_SERVER:5000"
    
    fun connect(userId: Int) {
        socket = IO.socket(SERVER_URL)
        
        socket?.apply {
            on(Socket.EVENT_CONNECT) {
                Log.d("Socket", "Connected")
                emit("join", mapOf("userId" to userId))
            }
            
            on("message") { args ->
                val message = args[0] as? Map<*, *>
                // Handle message
            }
            
            on("incoming_call") { args ->
                val call = args[0] as? Map<*, *>
                // Handle incoming call
            }
            
            connect()
        }
    }
    
    fun disconnect() {
        socket?.disconnect()
        socket = null
    }
    
    fun sendMessage(message: Message) {
        socket?.emit("send_message", message)
    }
}
```

### 5. WebRTC Manager (`webrtc/`)

```kotlin
// WebRTCManager.kt
class WebRTCManager(
    private val context: Context
) {
    private var peerConnectionFactory: PeerConnectionFactory? = null
    private var localPeerConnection: PeerConnection? = null
    private var remotePeerConnection: PeerConnection? = null
    private var localVideoTrack: VideoTrack? = null
    private var remoteVideoTrack: VideoTrack? = null
    
    fun initialize() {
        val initializationOptions = PeerConnectionFactory.InitializationOptions
            .builder(context)
            .setEnableInternalTracer(true)
            .createInitializationOptions()
        PeerConnectionFactory.initialize(initializationOptions)
        
        val encoderFactory = DefaultVideoEncoderFactory(
            rootEglBase.eglBaseContext,
            true,
            true
        )
        
        val decoderFactory = DefaultVideoDecoderFactory(rootEglBase.eglBaseContext)
        
        peerConnectionFactory = PeerConnectionFactory.builder()
            .setVideoEncoderFactory(encoderFactory)
            .setVideoDecoderFactory(decoderFactory)
            .createPeerConnectionFactory()
    }
    
    fun createOffer() {
        localPeerConnection?.createOffer(object : SdpObserver {
            override fun onCreateSuccess(sdp: SessionDescription) {
                localPeerConnection?.setLocalDescription(object : SdpObserver {
                    override fun onSetSuccess() {
                        // Send offer via WebSocket
                        SocketManager.sendOffer(sdp)
                    }
                    override fun onSetFailure(p0: String?) {}
                }, sdp)
            }
            override fun onCreateFailure(p0: String?) {}
            override fun onSetSuccess() {}
            override fun onSetFailure(p0: String?) {}
        })
    }
}
```

---

## 📱 UI Components

### 1. Login Screen (`ui/auth/LoginActivity.kt`)

```kotlin
class LoginActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityLoginBinding
    private lateinit var viewModel: AuthViewModel
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        viewModel = ViewModelProvider(this)[AuthViewModel::class.java]
        
        observeViewModel()
        setupListeners()
    }
    
    private fun observeViewModel() {
        viewModel.loginState.observe(this) { state ->
            when (state) {
                is AuthState.Loading -> {
                    binding.progressBar.visibility = View.VISIBLE
                    binding.btnLogin.isEnabled = false
                }
                is AuthState.Success -> {
                    startActivity(Intent(this, MainActivity::class.java))
                    finish()
                }
                is AuthState.Error -> {
                    Toast.makeText(this, state.message, Toast.LENGTH_SHORT).show()
                    binding.progressBar.visibility = View.GONE
                    binding.btnLogin.isEnabled = true
                }
                else -> {}
            }
        }
    }
    
    private fun setupListeners() {
        binding.btnLogin.setOnClickListener {
            val username = binding.etUsername.text.toString()
            val password = binding.etPassword.text.toString()
            viewModel.login(username, password)
        }
    }
}
```

### 2. Chat Screen (`ui/chat/ChatActivity.kt`)

```kotlin
class ChatActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityChatBinding
    private lateinit var viewModel: ChatViewModel
    private lateinit var messageAdapter: MessageAdapter
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityChatBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        val userId = intent.getIntExtra("userId", -1)
        viewModel = ViewModelProvider(this)[ChatViewModel::class.java]
        
        setupRecyclerView()
        observeViewModel()
        setupListeners()
        
        viewModel.loadMessages(userId)
    }
    
    private fun setupRecyclerView() {
        messageAdapter = MessageAdapter()
        binding.recyclerView.adapter = messageAdapter
    }
    
    private fun observeViewModel() {
        viewModel.messages.observe(this) { messages ->
            messageAdapter.submitList(messages)
            binding.recyclerView.scrollToPosition(messages.size - 1)
        }
    }
    
    private fun setupListeners() {
        binding.btnSend.setOnClickListener {
            val content = binding.etMessage.text.toString()
            if (content.isNotBlank()) {
                viewModel.sendMessage(content)
                binding.etMessage.setText("")
            }
        }
        
        binding.btnVoiceCall.setOnClickListener {
            // Start voice call
        }
        
        binding.btnVideoCall.setOnClickListener {
            // Start video call
        }
    }
}
```

### 3. Call Screen (`ui/call/CallActivity.kt`)

```kotlin
class CallActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityCallBinding
    private lateinit var webRTCManager: WebRTCManager
    private var isVideoCall = false
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCallBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        isVideoCall = intent.getBooleanExtra("isVideoCall", false)
        
        webRTCManager = WebRTCManager(this)
        webRTCManager.initialize()
        
        setupListeners()
        startCall()
    }
    
    private fun setupListeners() {
        binding.btnMute.setOnClickListener {
            webRTCManager.toggleMute()
        }
        
        binding.btnSpeaker.setOnClickListener {
            webRTCManager.toggleSpeaker()
        }
        
        binding.btnEndCall.setOnClickListener {
            webRTCManager.endCall()
            finish()
        }
    }
    
    private fun startCall() {
        if (isVideoCall) {
            webRTCManager.startVideoCall(
                localView = binding.localVideo,
                remoteView = binding.remoteVideo
            )
        } else {
            webRTCManager.startVoiceCall()
        }
    }
}
```

---

## 🎨 Layout XML Files

### Login Layout (`res/layout/activity_login.xml`)
```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:padding="24dp">
    
    <ImageView
        android:id="@+id/ivLogo"
        android:layout_width="120dp"
        android:layout_height="120dp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintBottom_toTopOf="@+id/etUsername"
        android:src="@drawable/ic_owl"
        android:layout_marginTop="80dp"
        android:layout_marginBottom="40dp"/>
    
    <EditText
        android:id="@+id/etUsername"
        android:layout_width="0dp"
        android:layout_height="56dp"
        android:hint="Username"
        android:paddingStart="16dp"
        android:paddingEnd="16dp"
        app:layout_constraintTop_toBottomOf="@+id/ivLogo"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_marginTop="40dp"
        android:background="@drawable/edit_text_background"/>
    
    <EditText
        android:id="@+id/etPassword"
        android:layout_width="0dp"
        android:layout_height="56dp"
        android:hint="Password"
        android:inputType="textPassword"
        android:paddingStart="16dp"
        android:paddingEnd="16dp"
        app:layout_constraintTop_toBottomOf="@+id/etUsername"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_marginTop="16dp"
        android:background="@drawable/edit_text_background"/>
    
    <Button
        android:id="@+id/btnLogin"
        android:layout_width="0dp"
        android:layout_height="56dp"
        android:text="Login"
        app:layout_constraintTop_toBottomOf="@+id/etPassword"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_marginTop="24dp"/>
    
    <ProgressBar
        android:id="@+id/progressBar"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:visibility="gone"
        app:layout_constraintTop_toBottomOf="@+id/btnLogin"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_marginTop="16dp"/>
    
</androidx.constraintlayout.widget.ConstraintLayout>
```

---

## 🔐 Security & Best Practices

### 1. SSL Pinning
```kotlin
// Add certificate pinning for secure connections
val certificatePinner = CertificatePinner.Builder()
    .add("your-server.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
    .build()
```

### 2. Sensitive Data Storage
```kotlin
// Use EncryptedSharedPreferences for sensitive data
val encryptedPrefs = EncryptedSharedPreferences.create(
    context,
    "secure_prefs",
    MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC),
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)
```

### 3. ProGuard Rules
```kotlin
# proguard-rules.pro
-keep class com.owltalk.data.** { *; }
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
}
-keep class kotlin.** { *; }
```

---

## 🧪 Testing

### Unit Tests
```kotlin
// Example test
class AuthViewModelTest {
    @Test
    fun `login should emit success state`() = runTest {
        val viewModel = AuthViewModel(mockAuthRepository)
        viewModel.login("test", "pass")
        
        assertEquals(AuthState.Success, viewModel.loginState.value)
    }
}
```

---

## 📦 Building & Deployment

### Debug Build
```bash
./gradlew assembleDebug
```

### Release Build
```bash
./gradlew assembleRelease
# Output: app/build/outputs/apk/release/app-release.apk
```

### Install APK
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 🚀 Getting Started Checklist

- [ ] Clone repository
- [ ] Open in Android Studio
- [ ] Update `BASE_URL` in `ApiClient.kt`
- [ ] Update `SERVER_URL` in `SocketManager.kt`
- [ ] Sync Gradle
- [ ] Run on device/emulator

---

## 📝 Next Steps

1. Implement Room database for offline support
2. Add Push Notifications (FCM)
3. Implement file upload/download
4. Add video recording/playback
5. Implement screen sharing
6. Add call history
7. Implement media gallery
8. Add emoji support
9. Implement message reactions
10. Add voice message recording

---

**For complete implementation, see the generated source files.**

