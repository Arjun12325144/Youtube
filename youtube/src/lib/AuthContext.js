 
// import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
// import { useState } from "react";
// import { createContext } from "react";
// import { provider, auth } from "./firebase";
// import axiosInstance from "./axiosinstance";
// import { useEffect, useContext } from "react";

// const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   const login = (userdata) => {
//     setUser(userdata);
//     localStorage.setItem("user", JSON.stringify(userdata));
//   };
//   const logout = async () => {
//     setUser(null);
//     localStorage.removeItem("user");
//     try {
//       await signOut(auth);
//     } catch (error) {
//       console.error("Error during sign out:", error);
//     }
//   };
//   const handkegooglesignin = async () => {
//     try {
//       const result = await signInWithPopup(auth, provider);
//       const firebaseuser = result.user;
//       const payload = {
//         email: firebaseuser.email,
//         name: firebaseuser.displayName,
//         image: firebaseuser.photoURL || "https://github.com/shadcn.png",
//       };
//       const response = await axiosInstance.post("/user/login", payload);
//       login(response.data.result);
//     } catch (error) {
//       console.error(error);
//     }
//   };
//   useEffect(() => {
//     const unsubcribe = onAuthStateChanged(auth, async (firebaseuser) => {
//       if (firebaseuser) {
//         try {
//           const payload = {
//             email: firebaseuser.email,
//             name: firebaseuser.displayName,
//             image: firebaseuser.photoURL || "https://github.com/shadcn.png",
//           };
//           const response = await axiosInstance.post("/user/login", payload);
//           login(response.data.result);
//         } catch (error) {
//           console.error(error);
//           logout();
//         }
//       }
//     });
//     return () => unsubcribe();
//   }, []);

//   return (
//     <UserContext.Provider value={{ user, login, logout, handkegooglesignin }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => useContext(UserContext);
// import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
// import { useState, useEffect, createContext, useContext } from "react";
// import { provider, auth } from "./firebase";
// import axiosInstance from "./axiosinstance";

// const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(() => {
//   if (typeof window !== "undefined") {
//     try {
//       const storedUser = localStorage.getItem("user");
//       if (!storedUser || storedUser === "undefined") return null;
//       return JSON.parse(storedUser);
//     } catch (error) {
//       console.error("Error parsing user from localStorage:", error);
//       localStorage.removeItem("user");
//       return null;
//     }
//   }
//   return null;
// });


//   const login = (userdata) => {
//     setUser(userdata);
//     localStorage.setItem("user", JSON.stringify(userdata));
//   };

//   const logout = async () => {
//     setUser(null);
//     localStorage.removeItem("user");
//     try {
//       await signOut(auth);
//     } catch (error) {
//       console.error("Error during sign out:", error);
//     }
//   };

//   const handkegooglesignin = async () => {
//     try {
//       const result = await signInWithPopup(auth, provider);
//       const firebaseuser = result.user;
//       console.log("Firebase user after popup:", firebaseuser); 
//       const payload = {
//         email: firebaseuser.email,
//         name: firebaseuser.displayName,
//         image: firebaseuser.photoURL || "https://github.com/shadcn.png",
//       };
//       const response = await axiosInstance.post("/user/login", payload);
//       login(response.data.result);
//       console.log("User after login():", response.data.result);
//     } catch (error) {
//       console.error("Google sign-in error:", error);
//     }
//   };

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (firebaseuser) => {
//       if (firebaseuser) {
//         try {
//           const payload = {
//             email: firebaseuser.email,
//             name: firebaseuser.displayName,
//             image: firebaseuser.photoURL || "https://github.com/shadcn.png",
//           };
//           const response = await axiosInstance.post("/user/login", payload);
//           login(response.data.result);
//         } catch (error) {
//           console.error("Error syncing with backend:", error);
//         }
//       } else {
//         logout();
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   return (
//     <UserContext.Provider value={{ user, login, logout, handkegooglesignin }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => useContext(UserContext);
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { useState, useEffect, createContext, useContext } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (!stored || stored === "undefined") return null;
        return JSON.parse(stored);
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
        localStorage.removeItem("user");
        return null;
      }
    }
    return null;
  });

  const login = (userdata) => {
    if (!userdata) return;
    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const handkegooglesignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;

      const payload = {
        email: firebaseuser.email,
        name: firebaseuser.displayName,
        image: firebaseuser.photoURL || "https://github.com/shadcn.png",
      };

      const response = await axiosInstance.post("/user/login", payload);
      const userData =
        response.data.result ||
        response.data.existingUser ||
        response.data.newuser ||
        payload;

      login(userData);
      console.log("✅ User after login():", userData);
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  // ✅ Persist Firebase login session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseuser) => {
      if (firebaseuser) {
        try {
          const payload = {
            email: firebaseuser.email,
            name: firebaseuser.displayName,
            image: firebaseuser.photoURL || "https://github.com/shadcn.png",
          };

          // Try to sync with backend. If backend fails (500), fall back to using the
          // Firebase payload locally so the UI remains usable during backend downtime.
          try {
            const response = await axiosInstance.post("/user/login", payload);
            const userData =
              response.data.result ||
              response.data.existingUser ||
              response.data.newuser ||
              payload;
            login(userData);
            console.log("🔁 Restored user from backend:", userData);
          } catch (err) {
            console.warn(
              "Backend /user/login failed — falling back to local Firebase payload:",
              err?.message || err
            );
            // Use the Firebase payload locally so the app doesn't crash and user can continue.
            login(payload);
          }
        } catch (error) {
          console.error("Unexpected error while syncing user:", error);
        }
      } else {
        // Only logout if there’s no stored user
        const stored = localStorage.getItem("user");
        if (!stored) logout();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout, handkegooglesignin }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
