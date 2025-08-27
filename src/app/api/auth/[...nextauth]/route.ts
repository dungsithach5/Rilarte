import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async session({ session, token }) {
      try {
        console.log('Session callback - token:', token);
        if (session?.user && (token as any).id) {
          session.user.id = (token as any).id;
          (session.user as any).onboarded = (token as any).onboarded || false;
          (session.user as any).gender = (token as any).gender || "";
          console.log('Session updated:', session.user);
        } else {
          console.log('No user ID in token, session:', session);
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        // Return session even if there's an error
        return session;
      }
    },
    async signIn({ user, account, profile }) {
      try {
        console.log('Sign in attempt:', {
          user: { id: user.id, email: user.email },
          provider: account?.provider
        });

        // Kiểm tra xem backend có hoạt động không
        try {
          // Gọi API backend để tạo/cập nhật user
          const response = await fetch('http://localhost:5001/api/users/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: account?.provider,
              providerAccountId: account?.providerAccountId
            })
          });

          if (response.ok) {
            const userData = await response.json();
            console.log('User created/updated:', userData);
            
            // Cập nhật user.id với ID từ server
            if (userData.success && userData.user?.id) {
              user.id = userData.user.id;
            }
            
            return true;
          } else {
            const errorData = await response.text();
            console.error('Failed to create/update user:', response.status, errorData);
            // Không return false, để user vẫn có thể sign in
            console.log('Backend error, but allowing sign in to continue');
          }
        } catch (backendError) {
          console.error('Backend connection error:', backendError);
          // Không return false, để user vẫn có thể sign in
          console.log('Backend connection failed, but allowing sign in to continue');
        }
        
        // Nếu backend không hoạt động, vẫn cho phép sign in
        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return true; // Luôn cho phép sign in
      }
    },
    async jwt({ token, user, account, trigger }) {
      try {
        console.log('JWT callback:', { token, user, account, trigger });
        
        // Nếu có user (lần đầu sign in)
        if (user) {
          token.id = user.id;
          // Gọi API để lấy thông tin onboarded
          try {
            const response = await fetch(`http://localhost:5001/api/users/email/${user.email}`);
            if (response.ok) {
              const userData = await response.json();
              (token as any).onboarded = userData.user.onboarded || false;
              (token as any).gender = userData.user.gender || "";
              console.log('User data loaded:', userData.user);
            }
          } catch (error) {
            console.error('Failed to get user data:', error);
            // Set default values nếu không thể kết nối backend
            (token as any).onboarded = false;
            (token as any).gender = "";
            console.log('Using default values due to backend connection error');
          }
        }
        
        // Nếu là update trigger (sau khi onboarding)
        if (trigger === 'update' && token.email) {
          try {
            const response = await fetch(`http://localhost:5001/api/users/email/${token.email}`);
            if (response.ok) {
              const userData = await response.json();
              (token as any).onboarded = userData.user.onboarded || false;
              (token as any).gender = userData.user.gender || "";
              console.log('Updated user data:', userData.user);
            }
          } catch (error) {
            console.error('Failed to get updated user data:', error);
          }
        }
        
        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
    },
  },
  debug: true,
});

export { handler as GET, handler as POST };
