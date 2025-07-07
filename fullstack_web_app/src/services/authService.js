class AuthService {
  login(email, password) {
    return new Promise((resolve, reject) => {
      if (email === 'test@example.com' && password === 'password') {
        const user = { email, name: 'Test User' };
        localStorage.setItem('user', JSON.stringify(user));
        resolve(user);
      } else {
        reject(new Error('Invalid email or password'));
      }
    });
  }

  signup(name, email, password) {
    return new Promise((resolve, reject) => {
      // In a real app, you'd create a new user in the database.
      // For this mock service, we'll just log the user in.
      const user = { name, email };
      localStorage.setItem('user', JSON.stringify(user));
      resolve(user);
    });
  }

  logout() {
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }
}

export const authService = new AuthService();