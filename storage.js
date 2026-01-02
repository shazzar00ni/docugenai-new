// ==================== //
// CLOUD STORAGE        //
// ==================== //

class CloudStorage {
    constructor() {
        this.storage = null;
        this.db = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        if (CONFIG.features.cloudStorage && typeof firebase !== 'undefined') {
            try {
                this.storage = firebase.storage();
                this.db = firebase.firestore();
                this.isInitialized = true;
            } catch (error) {
                console.error('Cloud storage initialization error:', error);
                this.useFallbackStorage();
            }
        } else {
            this.useFallbackStorage();
        }
    }

    useFallbackStorage() {
        // Use IndexedDB as fallback
        this.initIndexedDB();
    }

    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('DocuGenAI', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.indexedDB = request.result;
                this.isInitialized = true;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains('files')) {
                    db.createObjectStore('files', { keyPath: 'id' });
                }
                
                if (!db.objectStoreNames.contains('projects')) {
                    db.createObjectStore('projects', { keyPath: 'id' });
                }
            };
        });
    }

    // ==================== //
    // FILE OPERATIONS      //
    // ==================== //

    async uploadFile(file, path = '') {
        if (!authService.isAuthenticated()) {
            throw new Error('Please sign in to upload files');
        }

        const userId = authService.getUserId();
        const fileId = `${userId}/${path}${file.name}`;

        if (this.storage) {
            // Upload to Firebase Storage
            try {
                const storageRef = this.storage.ref(fileId);
                const snapshot = await storageRef.put(file);
                const downloadURL = await snapshot.ref.getDownloadURL();

                // Save metadata to Firestore
                await this.saveFileMetadata({
                    id: fileId,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: downloadURL,
                    userId: userId,
                    createdAt: new Date().toISOString()
                });

                return {
                    success: true,
                    fileId,
                    url: downloadURL
                };
            } catch (error) {
                console.error('Upload error:', error);
                throw error;
            }
        } else {
            // Fallback to IndexedDB
            return this.saveToIndexedDB(file, fileId);
        }
    }

    async saveToIndexedDB(file, fileId) {
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
            reader.onload = async (e) => {
                const fileData = {
                    id: fileId,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    content: e.target.result,
                    userId: authService.getUserId(),
                    createdAt: new Date().toISOString()
                };

                const transaction = this.indexedDB.transaction(['files'], 'readwrite');
                const store = transaction.objectStore('files');
                const request = store.put(fileData);

                request.onsuccess = () => {
                    resolve({
                        success: true,
                        fileId,
                        url: null
                    });
                };

                request.onerror = () => reject(request.error);
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    async getFile(fileId) {
        if (this.storage) {
            try {
                const storageRef = this.storage.ref(fileId);
                const url = await storageRef.getDownloadURL();
                return url;
            } catch (error) {
                console.error('Get file error:', error);
                throw error;
            }
        } else {
            return this.getFromIndexedDB(fileId);
        }
    }

    async getFromIndexedDB(fileId) {
        return new Promise((resolve, reject) => {
            const transaction = this.indexedDB.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const request = store.get(fileId);

            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result.content);
                } else {
                    reject(new Error('File not found'));
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    async deleteFile(fileId) {
        if (!authService.isAuthenticated()) {
            throw new Error('Please sign in to delete files');
        }

        if (this.storage) {
            try {
                const storageRef = this.storage.ref(fileId);
                await storageRef.delete();
                await this.deleteFileMetadata(fileId);
                return { success: true };
            } catch (error) {
                console.error('Delete error:', error);
                throw error;
            }
        } else {
            return this.deleteFromIndexedDB(fileId);
        }
    }

    async deleteFromIndexedDB(fileId) {
        return new Promise((resolve, reject) => {
            const transaction = this.indexedDB.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            const request = store.delete(fileId);

            request.onsuccess = () => resolve({ success: true });
            request.onerror = () => reject(request.error);
        });
    }

    async listUserFiles() {
        if (!authService.isAuthenticated()) {
            return [];
        }

        const userId = authService.getUserId();

        if (this.db) {
            try {
                const snapshot = await this.db.collection('files')
                    .where('userId', '==', userId)
                    .orderBy('createdAt', 'desc')
                    .get();

                return snapshot.docs.map(doc => doc.data());
            } catch (error) {
                console.error('List files error:', error);
                return [];
            }
        } else {
            return this.listFromIndexedDB(userId);
        }
    }

    async listFromIndexedDB(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.indexedDB.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const request = store.getAll();

            request.onsuccess = () => {
                const files = request.result.filter(f => f.userId === userId);
                resolve(files);
            };

            request.onerror = () => reject(request.error);
        });
    }

    // ==================== //
    // PROJECT OPERATIONS   //
    // ==================== //

    async saveProject(project) {
        if (!authService.isAuthenticated()) {
            throw new Error('Please sign in to save projects');
        }

        const userId = authService.getUserId();
        const projectId = project.id || `project_${Date.now()}`;
        
        const projectData = {
            ...project,
            id: projectId,
            userId,
            updatedAt: new Date().toISOString()
        };

        if (this.db) {
            try {
                await this.db.collection('projects').doc(projectId).set(projectData);
                return { success: true, projectId };
            } catch (error) {
                console.error('Save project error:', error);
                throw error;
            }
        } else {
            return this.saveProjectToIndexedDB(projectData);
        }
    }

    async saveProjectToIndexedDB(projectData) {
        return new Promise((resolve, reject) => {
            const transaction = this.indexedDB.transaction(['projects'], 'readwrite');
            const store = transaction.objectStore('projects');
            const request = store.put(projectData);

            request.onsuccess = () => {
                resolve({ success: true, projectId: projectData.id });
            };

            request.onerror = () => reject(request.error);
        });
    }

    async getProject(projectId) {
        if (this.db) {
            try {
                const doc = await this.db.collection('projects').doc(projectId).get();
                return doc.exists ? doc.data() : null;
            } catch (error) {
                console.error('Get project error:', error);
                throw error;
            }
        } else {
            return this.getProjectFromIndexedDB(projectId);
        }
    }

    async getProjectFromIndexedDB(projectId) {
        return new Promise((resolve, reject) => {
            const transaction = this.indexedDB.transaction(['projects'], 'readonly');
            const store = transaction.objectStore('projects');
            const request = store.get(projectId);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    async listUserProjects() {
        if (!authService.isAuthenticated()) {
            return [];
        }

        const userId = authService.getUserId();

        if (this.db) {
            try {
                const snapshot = await this.db.collection('projects')
                    .where('userId', '==', userId)
                    .orderBy('updatedAt', 'desc')
                    .get();

                return snapshot.docs.map(doc => doc.data());
            } catch (error) {
                console.error('List projects error:', error);
                return [];
            }
        } else {
            return this.listProjectsFromIndexedDB(userId);
        }
    }

    async listProjectsFromIndexedDB(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.indexedDB.transaction(['projects'], 'readonly');
            const store = transaction.objectStore('projects');
            const request = store.getAll();

            request.onsuccess = () => {
                const projects = request.result.filter(p => p.userId === userId);
                resolve(projects.sort((a, b) => 
                    new Date(b.updatedAt) - new Date(a.updatedAt)
                ));
            };

            request.onerror = () => reject(request.error);
        });
    }

    async deleteProject(projectId) {
        if (!authService.isAuthenticated()) {
            throw new Error('Please sign in to delete projects');
        }

        if (this.db) {
            try {
                await this.db.collection('projects').doc(projectId).delete();
                return { success: true };
            } catch (error) {
                console.error('Delete project error:', error);
                throw error;
            }
        } else {
            return this.deleteProjectFromIndexedDB(projectId);
        }
    }

    async deleteProjectFromIndexedDB(projectId) {
        return new Promise((resolve, reject) => {
            const transaction = this.indexedDB.transaction(['projects'], 'readwrite');
            const store = transaction.objectStore('projects');
            const request = store.delete(projectId);

            request.onsuccess = () => resolve({ success: true });
            request.onerror = () => reject(request.error);
        });
    }

    // ==================== //
    // METADATA OPERATIONS  //
    // ==================== //

    async saveFileMetadata(metadata) {
        if (this.db) {
            await this.db.collection('files').doc(metadata.id).set(metadata);
        }
    }

    async deleteFileMetadata(fileId) {
        if (this.db) {
            await this.db.collection('files').doc(fileId).delete();
        }
    }

    // ==================== //
    // UTILITY METHODS      //
    // ==================== //

    async getStorageUsage() {
        if (!authService.isAuthenticated()) {
            return { used: 0, total: 0 };
        }

        const files = await this.listUserFiles();
        const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);

        return {
            used: totalSize,
            total: CONFIG.storage.maxFileSize * 100, // Example: 1GB total
            percentage: (totalSize / (CONFIG.storage.maxFileSize * 100)) * 100
        };
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// Initialize cloud storage
const cloudStorage = new CloudStorage();
