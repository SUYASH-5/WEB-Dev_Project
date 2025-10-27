import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import gsap from "gsap";

const AuthLayout = () => {
  const location = useLocation();
  const containerRef = useRef(null);
  const floatImageRef = useRef(null);

  useEffect(() => {
    gsap.to(floatImageRef.current, {
      y: -15,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;

    gsap.fromTo(
      el,
      { opacity: 0, x: location.pathname.includes("register") ? 100 : -100 },
      { opacity: 1, x: 0, duration: 1, ease: "power3.out" }
    );
  }, [location.pathname]);

  const isRegister = location.pathname.includes("register");

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 px-8 "
    >
      <div
        className={`flex w-full max-w-6xl items-center justify-between gap-8  ${
          isRegister ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Form Side */}
        <div className="w-full max-w-md">
          <Outlet />
        </div>

        {/* Image Side */}
        <div className="hidden md:flex flex-1 justify-center relative">
          <img
            src="/image_bg.png"
            alt="Background"
            className="w-full h-auto rounded-2xl shadow-2xl object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl">
            <img
              ref={floatImageRef}
              src="/image_float.png"
              alt="Floating element"
              className="drop-shadow-2xl pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
