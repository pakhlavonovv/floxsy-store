'use client';
import { useState } from "react";
import Image from "next/image";
import Header from "../components/header";
import Loading from "../components/loading";
import '../components/style.css';
import GoogleIcon from '../../../public/images/google.webp';
import { useRouter } from "next/navigation";
import Footer from "../components/footer";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../../../firebase-config";  
import { doc, setDoc } from 'firebase/firestore';

const Page = () => {
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false); 
  const [modalMessage, setModalMessage] = useState(''); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); 
  const router = useRouter();
  const providerGoogle = new GoogleAuthProvider();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setModalMessage("Password is wrong! Please try again.");
      setShowModal(true);
      return;
    }
    setLoading(true); 
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setModalMessage(`😊 Dear ${email}, we are glad to have you back! We believe you will find the right and quality choice on Floxsy.`);
      setShowModal(true);
      const user = userCredential.user;
      const access_token = await user.getIdToken();  
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('login', email);
    } catch (err) {
      setError(true); 
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, providerGoogle);
      setModalMessage(`😊 Dear, ${email} we are glad to have you back! We believe you will find the right and quality choice on Floxsy.`);
      setShowModal(true);
      const user = result.user;
      const access_token = await user.getIdToken();  
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('login', email);
      await setDoc(doc(db, 'users', user.uid), {
        firstname: user.firstname || user.email,
        lastname: user.lastname || user.email,
        email: user.email,
        uid: user.uid,
      });
    } catch (error) {
      console.error('Error with Google sign-up:', error);
      setModalMessage('Failed to sign in with Google. Please try again.');
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value.endsWith('@gmail.com')) {
      setEmailPassword(false);
    } else {
      setEmailPassword(true);
    }
  };

  const closeModal = () => {
    if (modalMessage.startsWith('😊 Dear')) {
      router.push('/');
    } else {
      setShowModal(false);
    }
  };

  return (
    <div>
      {loading && <Loading />}
      <Header />
      <br className="hidden md:flex" />
      <div className="container flex flex-col items-center justify-center mt-4">
        <h1 className="text-[#112620] text-center text-[20px] sm:text-[25px] md:text-[30px] xl:text-[35px] font-bold">
          Welcome Back, Login to Floxsy
        </h1>
        <p className="text-[#112620] text-[13px] sm:text-[16px] md:text-[18px] text-center">
          Access your account and start shopping smarter today!
        </p>
        
        <form onSubmit={handleLogin} className="w-full mt-3 flex flex-col items-center justify-center gap-2 lg:gap-3">
          <input
            className="outline-[#2B4257] p-2 md:p-3 xl:p-4 w-[90%] sm:w-[400px] md:w-[450px] h-[35px] sm:h-[40px] md:h-[45px] text-[12px] sm:text-[15px] lg:text-[17px] border-[1px] border-[#091235] rounded-md"
            type="email"
            value={email}
            onChange={handleLoginChange}
            required
            placeholder="Enter Your Email"
          />
          <input
            className="outline-[#2B4257] p-2 md:p-3 xl:p-4 w-[90%] sm:w-[400px] md:w-[450px] h-[35px] sm:h-[40px] md:h-[45px] text-[12px] sm:text-[15px] lg:text-[17px] border-[1px] border-[#091235] rounded-md"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter Your Password"
          />
          <button
            type="submit"
            className="bg-[#091235] text-white w-[90%] sm:w-[400px] md:w-[450px] h-[35px] sm:h-[40px] md:h-[45px] text-[12px] sm:text-[15px] lg:text-[17px] rounded-md hover:bg-[#112620]"
          >
            Log in
          </button>
        </form>
        
        <button
          onClick={handleGoogleLogin}
          className="mt-2 w-[90%] sm:w-[400px] md:w-[450px] h-[35px] sm:h-[40px] md:h-[45px] flex items-center justify-center gap-1 text-[12px] sm:text-[15px] lg:text-[17px] border-[1px] border-[#091235] rounded-md bg-transparent"
        >
          <Image className="w-[25px] h-[25px]" src={GoogleIcon} alt="Google icon" /> Sign In with Google
        </button>
        {error ? (
          <p className="mt-2 text-[10px] sm:text-[12px] md:text-[14px] lg:text-[16px] text-red-500 text-center">
            Login or password wrong! Please try again.
          </p>
        ) : null}
        {emailPassword ? (
          <p className="mt-2 text-[10px] sm:text-[12px] md:text-[14px] lg:text-[16px] text-red-500 ">
            Your login must end with @gmail.com
          </p>
        ) : false}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[80%] sm:w-96">
              <button onClick={closeModal} className="absolute top-2 right-2 text-gray-600 text-xl">
                ×
              </button>
              <p className="text-center text-[14px] sm:text-[16px] lg:text-[18px] text-gray-800">{modalMessage}</p>
              <button
                onClick={closeModal}
                className="mt-4 w-full bg-red-500 text-[12px] sm:text-[16px] lg:text-[18px] text-white py-2 rounded-md transition-all hover:bg-[#935F4C]"
              >
                {modalMessage && modalMessage.startsWith('😊 Dear') 
                  ? 'Close and start shopping now' 
                  : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
      <br />
      <br />
      <br className="hidden md:flex" />
      <Footer />
    </div>
  );
};

export default Page;
