// Backend-integrated AI Service
// This replaces the mock service with real API calls

const AIServiceBackend = {
    API_BASE_URL: 'http://localhost:3000/api',

    // Generate content using backend API
    async generateContent(lessonTitle, contentTypes, userPreferences) {
        try {
            // Check if user is authenticated
            const token = AuthService?.getToken();
            if (!token) {
                throw new Error('Vui lòng đăng nhập để tạo bài giảng');
            }

            const response = await fetch(`${this.API_BASE_URL}/ai/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: lessonTitle,
                    content_types: contentTypes
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Không thể tạo bài giảng');
            }

            // Return content and lesson ID
            return {
                lessonId: data.data.lesson_id,
                content: data.data.content
            };
        } catch (error) {
            console.error('AI generation error:', error);
            throw error;
        }
    },

    // Get all user's lessons
    async getLessons(page = 1, limit = 20) {
        try {
            const token = AuthService?.getToken();
            if (!token) {
                throw new Error('Vui lòng đăng nhập');
            }

            const response = await fetch(`${this.API_BASE_URL}/lessons?page=${page}&limit=${limit}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Không thể tải danh sách bài giảng');
            }

            return data.data;
        } catch (error) {
            console.error('Get lessons error:', error);
            throw error;
        }
    },

    // Get specific lesson
    async getLesson(lessonId) {
        try {
            const token = AuthService?.getToken();
            if (!token) {
                throw new Error('Vui lòng đăng nhập');
            }

            const response = await fetch(`${this.API_BASE_URL}/lessons/${lessonId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Không thể tải bài giảng');
            }

            return data.data.lesson;
        } catch (error) {
            console.error('Get lesson error:', error);
            throw error;
        }
    },

    // Delete lesson
    async deleteLesson(lessonId) {
        try {
            const token = AuthService?.getToken();
            if (!token) {
                throw new Error('Vui lòng đăng nhập');
            }

            const response = await fetch(`${this.API_BASE_URL}/lessons/${lessonId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Không thể xóa bài giảng');
            }

            return true;
        } catch (error) {
            console.error('Delete lesson error:', error);
            throw error;
        }
    }
};

// Use backend service if authenticated, otherwise use mock
const AIService = {
    async generateContent(lessonTitle, contentTypes, userPreferences) {
        if (typeof AuthService !== 'undefined' && AuthService.isAuthenticated()) {
            // Use backend API
            const result = await AIServiceBackend.generateContent(lessonTitle, contentTypes, userPreferences);
            return result;
        } else {
            // Use mock service (fallback)
            return await AIServiceMock.generateContent(lessonTitle, contentTypes, userPreferences);
        }
    }
};

// Keep mock service as fallback (original code)
const AIServiceMock = {
    async generateContent(lessonTitle, contentTypes, userPreferences) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { level, subject } = userPreferences;
        const result = {};

        if (contentTypes.includes('slide')) {
            result.slides = this._generateSlides(lessonTitle, level, subject);
        }

        if (contentTypes.includes('infographic')) {
            result.infographic = this._generateInfographic(lessonTitle, level);
        }

        if (contentTypes.includes('mindmap')) {
            result.mindmap = this._generateMindmap(lessonTitle, level);
        }

        if (contentTypes.includes('quiz')) {
            result.quiz = this._generateQuiz(lessonTitle, level, subject);
        }

        return { content: result };
    },

    _generateSlides(title, level, subject) {
        return [
            {
                type: 'title',
                content: `<h1 style="color: #4DA8DA; font-size: 3rem; margin-bottom: 1rem;">${title}</h1>
                         <p style="font-size: 1.5rem; color: #6B7280;">Môn: ${subject}</p>`
            },
            {
                type: 'content',
                content: `<h2 style="color: #4DA8DA; margin-bottom: 1.5rem;">Mục tiêu bài học</h2>
                         <ul style="font-size: 1.25rem; line-height: 2; text-align: left; max-width: 600px; margin: 0 auto;">
                            <li>Hiểu được khái niệm cơ bản</li>
                            <li>Áp dụng kiến thức vào thực tế</li>
                         </ul>`
            }
        ];
    },

    _generateInfographic(title, level) {
        return {
            url: 'https://via.placeholder.com/1200x1600/4DA8DA/FFFFFF?text=Infographic',
            description: `Infographic cho bài "${title}"`
        };
    },

    _generateMindmap(title, level) {
        return {
            central: title,
            branches: [
                { title: 'Khái niệm', subbranches: ['Định nghĩa', 'Đặc điểm'] },
                { title: 'Ứng dụng', subbranches: ['Học tập', 'Cuộc sống'] }
            ]
        };
    },

    _generateQuiz(title, level, subject) {
        const questions = [];
        for (let i = 1; i <= 10; i++) {
            questions.push({
                id: i,
                question: `Câu hỏi ${i} về ${title}?`,
                options: [
                    { id: 'A', text: 'Đáp án đúng ✓', correct: true },
                    { id: 'B', text: 'Đáp án sai', correct: false },
                    { id: 'C', text: 'Đáp án sai', correct: false },
                    { id: 'D', text: 'Đáp án sai', correct: false }
                ],
                explanation: '💡 Giải thích: Đây là đáp án đúng.',
                correctAnswer: 'A'
            });
        }
        return questions;
    }
};
