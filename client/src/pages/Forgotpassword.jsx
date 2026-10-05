import React, { useEffect, useRef, useState } from "react";

function ForgotPassword() {
  // STEP: email -> otp -> reset
  const [step, setStep] = useState("email");

  // FORM DATA
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // PASSWORD VISIBILITY
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP ANIMATION
  const [visibleOtpBoxes, setVisibleOtpBoxes] = useState(0);
  const otpRefs = useRef([]);

  // RESET ANIMATION
  const [resetAnimating, setResetAnimating] = useState(false);

  // OTP BOXES - ONE BY ONE (550ms each) + focus first box
  useEffect(() => {
    if (step !== "otp") {
      return;
    }

    setVisibleOtpBoxes(0);

    requestAnimationFrame(() => {
      otpRefs.current[0]?.focus();
    });

    let currentBox = 0;

    const timer = setInterval(() => {
      currentBox += 1;

      setVisibleOtpBoxes(currentBox);

      if (currentBox >= 6) {
        clearInterval(timer);
      }
    }, 550);

    return () => {
      clearInterval(timer);
    };
  }, [step]);

  // SUBMIT EMAIL
  const handleEmailSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    setStep("otp");
  };

  // OTP CHANGE
  const handleOtpChange = (event, index) => {
    const number = event.target.value.replace(/\D/g, "");
    const updatedOtp = [...otp];

    if (!number) {
      updatedOtp[index] = "";
      setOtp(updatedOtp);
      return;
    }

    updatedOtp[index] = number.slice(-1);
    setOtp(updatedOtp);

    if (index < 5) {
      requestAnimationFrame(() => {
        otpRefs.current[index + 1]?.focus();
      });
    }
  };

  // OTP KEYS (Backspace, arrows, Enter)
  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleOtpSubmit(event);
      return;
    }

    if (event.key === "Backspace") {
      if (otp[index]) {
        const updatedOtp = [...otp];
        updatedOtp[index] = "";
        setOtp(updatedOtp);
        return;
      }

      if (index > 0) {
        const updatedOtp = [...otp];
        updatedOtp[index - 1] = "";
        setOtp(updatedOtp);

        requestAnimationFrame(() => {
          otpRefs.current[index - 1]?.focus();
        });
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // OTP PASTE
  const handleOtpPaste = (event) => {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedValue) {
      return;
    }

    const updatedOtp = ["", "", "", "", "", ""];

    pastedValue.split("").forEach((number, index) => {
      updatedOtp[index] = number;
    });

    setOtp(updatedOtp);

    const focusIndex = Math.min(pastedValue.length, 5);

    requestAnimationFrame(() => {
      otpRefs.current[focusIndex]?.focus();
    });
  };

  // SUBMIT OTP
  const handleOtpSubmit = (event) => {
    event.preventDefault();

    if (visibleOtpBoxes < 6) {
      return;
    }

    if (otp.join("").length !== 6) {
      alert("Please enter the complete 6-digit OTP.");
      return;
    }

    setResetAnimating(true);
    setStep("reset");
  };

  // RESET ANIMATION END
  const handleResetAnimationEnd = () => {
    setResetAnimating(false);
  };

  // RESET PASSWORD
  const handleResetPassword = (event) => {
    event.preventDefault();

    if (!newPassword.trim()) {
      alert("Please enter your new password.");
      return;
    }

    if (!confirmPassword.trim()) {
      alert("Please confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    alert("Password reset successfully.");
  };

  // ICONS
  const MailIcon = () => (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
      <rect x="3" y="5" width="22" height="18" rx="2" stroke="black" strokeWidth="2.6" />
      <path d="M4 7L14 15L24 7" stroke="black" strokeWidth="2.6" strokeLinecap="square" />
    </svg>
  );

  const LockIcon = () => (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
      <rect x="6" y="12" width="16" height="13" rx="2" stroke="black" strokeWidth="2.6" />
      <path
        d="M9 12V8.5C9 5.73858 11.2386 3.5 14 3.5C16.7614 3.5 19 5.73858 19 8.5V12"
        stroke="black"
        strokeWidth="2.6"
      />
      <circle cx="14" cy="18" r="1.8" fill="black" />
    </svg>
  );

  // plain eye = password hidden (click to show), slashed eye = password visible
  const EyeIcon = ({ visible }) => (
    <svg width="28" height="26" viewBox="0 0 30 30" fill="none">
      <path
        d="M3 15C3 15 7 8 15 8C23 8 27 15 27 15C27 15 23 22 15 22C7 22 3 15 3 15Z"
        stroke="black"
        strokeWidth="2.6"
      />
      <circle cx="15" cy="15" r="3.5" fill="black" />
      {visible && <path d="M5 5L25 25" stroke="black" strokeWidth="2.6" />}
    </svg>
  );

  const ArrowIcon = () => (
    <svg width="32" height="24" viewBox="0 0 43 30" fill="none">
      <path d="M2 15H38" stroke="black" strokeWidth="4" />
      <path d="M27 4L38 15L27 26" stroke="black" strokeWidth="4" strokeLinecap="square" />
    </svg>
  );

  // shared classes (content size)
  const labelClass = "text-[19px] font-extrabold leading-none text-black";

  const inputBoxClass =
    "flex w-full min-w-0 items-center border-2 border-black bg-white px-[15px]";

  const inputClass =
    "h-full w-full min-w-0 border-none bg-transparent text-[19px] font-normal text-black outline-none placeholder:text-[#6f6f6f]";

  const changeEmailClass =
    "text-[18px] font-black leading-none text-black underline underline-offset-2";

  const buttonClass =
    "relative mt-[31px] flex h-[54px] w-full items-center justify-center border-[2.5px] border-black bg-[#59e6ad] text-[22px] font-black tracking-[0.3px] text-black shadow-[5px_5px_0_#000] transition duration-150 hover:translate-y-[-2px] active:translate-y-[1px] active:shadow-[2px_2px_0_#000] disabled:cursor-not-allowed disabled:bg-[#59e6ad]/60";

  const arrowWrapClass = "absolute right-[18px] flex items-center";

  // EMAIL STEP
  const EmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="w-full">
      <div className="mb-[11px] flex items-center justify-between">
        <label className={labelClass}>Email</label>

        <button type="button" className={changeEmailClass}>
          Change Email
        </button>
      </div>

      <div className={`${inputBoxClass} h-[52px]`}>
        <div className="mr-[13px] flex shrink-0 items-center">
          <MailIcon />
        </div>

        <input
          type="email"
          value={email}
          autoFocus
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          className={inputClass}
        />
      </div>

      <button type="submit" className={buttonClass}>
        SUBMIT
        <span className={arrowWrapClass}>
          <ArrowIcon />
        </span>
      </button>
    </form>
  );

  // OTP STEP
  const OtpStep = () => (
    <form onSubmit={handleOtpSubmit} className="w-full">
      <div className="mb-[11px] flex items-center justify-between">
        <label className={labelClass}>Email</label>

        <button
          type="button"
          onClick={() => {
            setStep("email");
            setVisibleOtpBoxes(0);
          }}
          className={changeEmailClass}
        >
          Change Email
        </button>
      </div>

      <div className={`${inputBoxClass} h-[52px]`}>
        <div className="mr-[13px] flex shrink-0 items-center">
          <MailIcon />
        </div>

        <input
          type="email"
          value={email}
          readOnly
          placeholder="Enter your email"
          className={inputClass}
        />
      </div>

      <div className="mt-[29px]">
        <label className={labelClass}>OTP</label>
      </div>

      <div className="mt-[11px] flex w-full items-center justify-between gap-[9px]">
        {otp.map((digit, index) => {
          const isVisible = index < visibleOtpBoxes;

          return (
            <input
              key={index}
              ref={(element) => {
                otpRefs.current[index] = element;
              }}
              id={`otp-box-${index}`}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={(event) => handleOtpChange(event, index)}
              onKeyDown={(event) => handleOtpKeyDown(event, index)}
              onPaste={index === 0 ? handleOtpPaste : undefined}
              className={`
                h-[56px]
                w-0
                min-w-0
                flex-1
                border-2
                border-black
                bg-white
                text-center
                text-[26px]
                font-black
                text-black
                outline-none
                shadow-[4px_4px_0_#000]
                transition-all
                duration-700
                ease-out
                ${
                  isVisible
                    ? "animate-[otpBoxIn_700ms_ease-out_both]"
                    : "opacity-0 translate-y-[15px] scale-90"
                }
                focus:bg-[#faf8ff]
                focus:shadow-[5px_5px_0_#000]
              `}
            />
          );
        })}
      </div>

      <p
        className={`
          mt-[13px]
          text-[16px]
          font-medium
          leading-none
          text-[#6f6f6f]
          transition-opacity
          duration-500
          ${visibleOtpBoxes === 6 ? "opacity-100" : "opacity-0"}
        `}
      >
        Enter the 6-digit code sent to your email
      </p>

      <button
        type="submit"
        disabled={visibleOtpBoxes < 6 || otp.some((digit) => !digit)}
        className={buttonClass}
      >
        SUBMIT OTP
        <span className={arrowWrapClass}>
          <ArrowIcon />
        </span>
      </button>
    </form>
  );

  // RESET PASSWORD STEP
  const ResetStep = () => (
    <form
      onSubmit={handleResetPassword}
      onAnimationEnd={handleResetAnimationEnd}
      className={`w-full ${
        resetAnimating ? "animate-[resetSlide_500ms_ease-out_both]" : ""
      }`}
    >
      {/* NEW PASSWORD */}
      <div>
        <label className={labelClass}>New Password</label>

        <div className={`${inputBoxClass} mt-[11px] h-[54px]`}>
          <div className="mr-[15px] shrink-0">
            <LockIcon />
          </div>

          <input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            autoFocus
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Enter new password"
            className={inputClass}
          />

          <button
            type="button"
            onClick={() => setShowNewPassword((previous) => !previous)}
            className="ml-[8px] shrink-0 border-none bg-transparent p-0"
          >
            <EyeIcon visible={showNewPassword} />
          </button>
        </div>
      </div>

      {/* CONFIRM PASSWORD */}
      <div className="mt-[29px]">
        <label className={labelClass}>Confirm Password</label>

        <div className={`${inputBoxClass} mt-[11px] h-[54px]`}>
          <div className="mr-[15px] shrink-0">
            <LockIcon />
          </div>

          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
            className={inputClass}
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((previous) => !previous)}
            className="ml-[8px] shrink-0 border-none bg-transparent p-0"
          >
            <EyeIcon visible={showConfirmPassword} />
          </button>
        </div>
      </div>

      {/* RESET PASSWORD */}
      <button type="submit" className={`${buttonClass} !mt-[38px]`}>
        RESET PASSWORD
        <span className={arrowWrapClass}>
          <ArrowIcon />
        </span>
      </button>
    </form>
  );

  // STAIRCASE SHAPES (clip-path clips box-shadow/ring, so outlines use SVG / drop-shadow)
  const stepsTopRight =
    "polygon(0 0,100% 0,100% 100%,72% 100%,72% 82%,54% 82%,54% 64%,36% 64%,36% 46%,18% 46%,18% 28%,0 28%)";

  const stepsBottomLeft =
    "polygon(0 0,25% 0,25% 23%,50% 23%,50% 46%,75% 46%,75% 69%,100% 69%,100% 100%,0 100%)";

  // MAIN PAGE
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#fdfdfb] font-[Roboto,Arial,Helvetica,sans-serif]">
      {/* DOT BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(#bcbcbc_1.2px,transparent_1.2px)] [background-size:20px_20px]" />

      {/* TOP RIGHT PURPLE STAIRCASE (with hard shadow) */}
      <div className="pointer-events-none absolute right-0 top-0 z-0 [filter:drop-shadow(-5px_5px_0_#000)]">
        <div
          className="h-[88px] w-[110px] bg-[#8665f4]"
          style={{ clipPath: stepsTopRight }}
        />
      </div>

      {/* HEADER */}
      <header className="relative z-20 flex items-start px-[24px] pt-[24px]">
        <div className="flex items-start gap-[10px]">
          <div className="flex h-[52px] w-[48px] items-center justify-center border-[2.5px] border-black bg-[#ffdd2f] text-[22px] font-black text-black shadow-[2px_2px_0_#000]">
            AI
          </div>

          <div className="pt-[7px]">
            <h1 className="text-[19px] font-black leading-none tracking-[-0.2px] text-black">
              AI INTERVIEW
            </h1>

            <p className="mt-[6px] text-[11px] font-bold leading-none text-black">
              PRACTICE. IMPROVE. SUCCEED.
            </p>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT - fixed compact box (max 800px); grid columns can never stretch */}
      <main className="relative z-10 mx-auto flex w-full max-w-[880px] flex-1 items-center justify-center px-[20px] pb-[40px]">
        <div className="grid w-full grid-cols-[minmax(0,51fr)_minmax(0,49fr)] items-stretch gap-[14px]">
          {/* LEFT PURPLE CARD */}
          <section className="relative min-h-[505px] min-w-0 overflow-hidden border-[2.5px] border-black bg-[#8665f4] shadow-[7px_7px_0_#000]">
            <div className="relative z-10 pl-[22px] pt-[50px]">
              <h2 className="text-[46px] font-black leading-[57px] tracking-[-1.3px] text-black">
                <span className="block pl-[11px]">FORGET THE</span>
                <span className="block pl-[11px]">MISTAKE,</span>
                <span className="block w-fit bg-white px-[11px]">REMEMBER</span>
                <span className="block w-fit bg-white px-[11px]">THE LESSON.</span>
              </h2>
            </div>

            {/* SPARKLE STAR */}
            <svg
              className="absolute right-[24px] top-[26px] z-20"
              width="46"
              height="46"
              viewBox="0 0 74 74"
              fill="none"
            >
              <path
                d="M37 3C40 25 49 34 71 37C49 40 40 49 37 71C34 49 25 40 3 37C25 34 34 25 37 3Z"
                fill="#ffdc2e"
                stroke="black"
                strokeWidth="4"
                strokeLinejoin="round"
              />
            </svg>

            {/* DOTS */}
            <div className="absolute bottom-[20px] left-[24px] grid grid-cols-5 gap-[13px]">
              {Array.from({ length: 25 }).map((_, index) => (
                <span key={index} className="h-[3px] w-[3px] rounded-full bg-black" />
              ))}
            </div>

            {/* GREEN STAIRCASE */}
            <svg
              className="absolute bottom-0 right-0"
              width="132"
              height="114"
              viewBox="0 0 212 184"
              fill="none"
            >
              <polygon
                points="2,184 2,150 52,150 52,102 102,102 102,52 152,52 152,2 212,2 212,184"
                fill="#59e6ad"
                stroke="black"
                strokeWidth="5"
              />
            </svg>
          </section>

          {/* RIGHT WHITE CARD */}
          <section className="relative min-h-[505px] min-w-0 border-[2.5px] border-black bg-white shadow-[7px_7px_0_#000]">
            <div className="relative flex h-full w-full items-start pl-[24px] pr-[20px] pt-[31px]">
              <div className="w-full min-w-0 overflow-hidden pb-[8px] pr-[6px]">
                {/* TITLE */}
                <div className="mb-[37px] flex w-full items-center justify-center border-[2.5px] border-black bg-[#8665f4] py-[12px] shadow-[5px_5px_0_#000]">
                  <h2 className="whitespace-nowrap text-[29px] font-black leading-none tracking-[-0.5px] text-black">
                    FORGOT PASSWORD
                  </h2>
                </div>

                {/* FORM - called as functions (not <Component />) so inputs keep focus while typing */}
                {step === "email" && EmailStep()}
                {step === "otp" && OtpStep()}
                {step === "reset" && ResetStep()}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* PINK SQUARE */}
      <div className="pointer-events-none absolute right-[32px] top-[120px] h-[38px] w-[38px] border-[2.5px] border-black bg-[#f05b79] shadow-[3px_3px_0_#000]" />

      {/* RIGHT DOTS */}
      <div className="pointer-events-none absolute right-[18px] top-[208px] grid grid-cols-5 gap-x-[11px] gap-y-[13px]">
        {Array.from({ length: 50 }).map((_, index) => (
          <span key={index} className="h-[3px] w-[3px] rounded-full bg-black" />
        ))}
      </div>

      {/* BOTTOM LEFT BLACK STAIRCASE */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[88px] w-[92px] bg-black"
        style={{ clipPath: stepsBottomLeft }}
      />

      {/* YELLOW CIRCLE */}
      <div className="pointer-events-none absolute bottom-[15px] left-[18%] h-[53px] w-[53px] rounded-full border-[2.5px] border-black bg-[#ffdc2e]" />

      {/* BOTTOM RIGHT PURPLE SQUARE */}
      <div className="pointer-events-none absolute bottom-[48px] right-[31px] h-[40px] w-[40px] border-[2.5px] border-black bg-[#8665f4] shadow-[3px_3px_0_#000]" />

      {/* ANIMATIONS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');

        @keyframes otpBoxIn {
          0% { opacity: 0; transform: translateY(15px) scale(0.90); }
          60% { opacity: 1; transform: translateY(-2px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes resetSlide {
          0% { transform: translateX(115%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default ForgotPassword;