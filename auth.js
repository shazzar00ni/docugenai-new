// ==================== //
// AUTHENTICATION       //
// ==================== //

class AuthService {
    constructor() {
        this.user = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        // Initialize Firebase Auth if configured
        if (CONFIG.features.authentication && typeof firebase !== 'undefined') {
            try {
                if (!firebase.apps.length) {
                    firebase.initializeApp(CONFIG.api.firebase);
                }
                this.auth = firebase.auth();
                this.setupAuthStateListener();
                this.isInitialized = true;
            } catch (error) {
                console.error('Firebase initialization error:', error);
                this.useFallbackAuth();
            }
        } else {
            this.useFallbackAuth();
        }
    }

    useFallbackAuth() {
        // Use localStorage-based auth as fallback
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                this.user = JSON.parse(savedUser);
                this.dispatchAuthEvent('login', this.user);
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
        this.isInitialized = true;
    }

    setupAuthStateListener() {
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.user = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName || user.email,
                    photoURL: user.photoURL,
                    emailVerified: user.emailVerified
                };
                this.dispatchAuthEvent('login', this.user);
                this.saveUserToLocalStorage();
            } else {
                this.user = null;
                this.dispatchAuthEvent('logout');
                localStorage.removeItem('user');
            }
        });
    }

    async signUpWithEmail(email, password, displayName) {
        if (this.auth) {
            try {
                const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
                
                // Update profile
                if (displayName) {
                    await userCredential.user.updateProfile({
                        displayName: displayName
                    });
                }

                // Send verification email
                await userCredential.user.sendEmailVerification();
                
                return {
                    success: true,
                    message: 'Account created! Please check your email for verification.'
                };
            } catch (error) {
                return {
                    success: false,
                    message: this.getErrorMessage(error.code)
                };
            }
        } else {
            // Fallback: simple local storage
            return this.fallbackSignUp(email, password, displayName);
        }
    }

    async signInWithEmail(email, password) {
        if (this.auth) {
            try {
                await this.auth.signInWithEmailAndPassword(email, password);
                return {
                    success: true,
                    message: 'Signed in successfully!'
                };
            } catch (error) {
                return {
                    success: false,
                    message: this.getErrorMessage(error.code)
                };
            }
        } else {
            return this.fallbackSignIn(email, password);
        }
    }

    async signInWithGoogle() {
        if (this.auth) {
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                await this.auth.signInWithPopup(provider);
                return {
                    success: true,
                    message: 'Signed in with Google!'
                };
            } catch (error) {
                return {
                    success: false,
                    message: this.getErrorMessage(error.code)
                };
            }
        } else {
            return {
                success: false,
                message: 'Google sign-in not available in demo mode'
            };
        }
    }

    async signOut() {
        if (this.auth) {
            await this.auth.signOut();
        } else {
            this.user = null;
            localStorage.removeItem('user');
            this.dispatchAuthEvent('logout');
        }
    }

    async resetPassword(email) {
        if (this.auth) {
            try {
                await this.auth.sendPasswordResetEmail(email);
                return {
                    success: true,
                    message: 'Password reset email sent!'
                };
            } catch (error) {
                return {
                    success: false,
                    message: this.getErrorMessage(error.code)
                };
            }
        } else {
            return {
                success: false,
                message: 'Password reset not available in demo mode'
            };
        }
    }

    // Fallback methods for demo/offline mode
    fallbackSignUp(email, password, displayName) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (users.find(u => u.email === email)) {
            return {
                success: false,
                message: 'Email already registered'
            };
        }

        const newUser = {
            uid: 'local_' + Date.now(),
            email,
            displayName: displayName || email,
            password: btoa(password), // Simple encoding (NOT secure for production!)
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        this.user = {
            uid: newUser.uid,
            email: newUser.email,
            displayName: newUser.displayName
        };
        this.saveUserToLocalStorage();
        this.dispatchAuthEvent('login', this.user);

        return {
            success: true,
            message: 'Account created! (Demo mode)'
        };
    }

    fallbackSignIn(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === btoa(password));

        if (user) {
            this.user = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
            };
            this.saveUserToLocalStorage();
            this.dispatchAuthEvent('login', this.user);

            return {
                success: true,
                message: 'Signed in! (Demo mode)'
            };
        }

        return {
            success: false,
            message: 'Invalid email or password'
        };
    }

    saveUserToLocalStorage() {
        if (this.user) {
            localStorage.setItem('user', JSON.stringify(this.user));
        }
    }

    getErrorMessage(errorCode) {
        const messages = {
            'auth/email-already-in-use': 'This email is already registered',
            'auth/invalid-email': 'Invalid email address',
            'auth/weak-password': 'Password should be at least 6 characters',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/too-many-requests': 'Too many attempts. Please try again later',
            'auth/network-request-failed': 'Network error. Please check your connection'
        };

        return messages[errorCode] || 'An error occurred. Please try again.';
    }

    dispatchAuthEvent(type, user = null) {
        window.dispatchEvent(new CustomEvent('authStateChanged', {
            detail: { type, user }
        }));
    }

    isAuthenticated() {
        return !!this.user;
    }

    getCurrentUser() {
        return this.user;
    }

    getUserId() {
        return this.user?.uid || null;
    }
}

// Initialize auth service
const authService = new AuthService();
