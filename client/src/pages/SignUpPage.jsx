import { ArrowRight, Lock, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo.jsx'
import BrutalistButton from '../components/BrutalistButton.jsx'
import BrutalistCard from '../components/BrutalistCard.jsx'
import GoogleButton from '../components/GoogleButton.jsx'
import HeroPanel from '../components/HeroPanel.jsx'
import InputField from '../components/InputField.jsx'
import OtpInput from '../components/OtpInput.jsx'
import PasswordField from '../components/PasswordField.jsx'
import ProfilePhotoUploader from '../components/ProfilePhotoUploader.jsx'

const pageClassName =
  'relative min-h-screen overflow-x-hidden px-[8px] py-[6px] text-[#111] max-[1100px]:px-3 max-[1100px]:py-3 max-[720px]:px-3 max-[720px]:py-3 max-[560px]:px-[10px] max-[560px]:py-[10px]'

const profilePageClassName =
  'relative min-h-screen overflow-x-hidden px-[6px] py-[4px] text-[#111] max-[1100px]:px-[10px] max-[1100px]:py-[10px] max-[720px]:px-3 max-[720px]:py-3 max-[560px]:px-[10px] max-[560px]:py-[10px]'

const shellClassName =
  'relative z-10 mx-auto flex w-full max-w-[1120px] min-h-[calc(100vh-12px)] flex-col justify-center max-[1100px]:max-w-[820px] max-[1100px]:min-h-0'

const profileShellClassName =
  'relative z-10 mx-auto flex w-full max-w-[860px] min-h-[calc(100vh-12px)] flex-col justify-center max-[1100px]:max-w-[720px] max-[1100px]:min-h-0'

const signUpSectionClassName =
  'grid grid-cols-[minmax(0,1fr)_minmax(0,460px)] items-start gap-[32px] max-[1100px]:grid-cols-1 max-[1100px]:gap-4 max-[720px]:gap-3'

const profileSignUpSectionClassName =
  'grid grid-cols-[minmax(0,1fr)_minmax(0,380px)] items-start gap-[24px] max-[1100px]:grid-cols-1 max-[1100px]:gap-3 max-[720px]:gap-3'

const cardInnerClassName = 'relative z-10 flex flex-1 flex-col'

const profileCardInnerClassName = 'relative z-10 flex flex-1 flex-col'

const headingClassName =
  'relative z-10 mt-[20px] mb-5 w-fit border-[3px] border-[#111] bg-[#6f4be4] px-[14px] py-[8px] text-[clamp(1.65rem,2.1vw,2.35rem)] font-black leading-none tracking-[-0.09em] text-[#111] shadow-[5px_5px_0_#111] max-[720px]:mb-[12px] max-[720px]:px-[14px] max-[720px]:py-[8px] max-[720px]:text-[1.55rem] max-[560px]:text-[1.35rem] max-[560px]:shadow-[4px_4px_0_#111]'

const subtitleClassName =
  'relative z-10 mb-8 text-[0.9rem] leading-[1.45] text-[#111] max-[720px]:mb-5 max-[720px]:text-[0.86rem] max-[560px]:mb-4 max-[560px]:text-[0.82rem]'

const profileHeadingClassName =
  'relative z-10 mt-[3px] mb-2 w-fit border-[3px] border-[#111] bg-[#6f4be4] px-[11px] py-[6px] text-[clamp(1.28rem,1.65vw,1.95rem)] font-black leading-none tracking-[-0.09em] text-[#111] shadow-[4px_4px_0_#111] max-[720px]:mb-[10px] max-[720px]:px-[11px] max-[720px]:py-[6px] max-[720px]:text-[1.28rem] max-[560px]:text-[1.16rem] max-[560px]:shadow-[3px_3px_0_#111]'

const profileSubtitleClassName =
  'relative z-10 mb-4 text-[0.72rem] leading-[1.42] text-[#111] max-[720px]:mb-3 max-[720px]:text-[0.7rem] max-[560px]:mb-2.5 max-[560px]:text-[0.66rem]'

const dividerClassName =
  'my-6 flex items-center gap-4 max-[720px]:my-5 max-[560px]:my-4 max-[560px]:gap-3'

const dividerLineClassName = 'h-[2px] flex-1 bg-[rgba(17,17,17,0.65)]'

const dividerTextClassName =
  'text-[0.86rem] font-black tracking-[-0.04em] text-[#111] max-[560px]:text-[0.78rem]'

const loginRowClassName =
  'flex items-center justify-center gap-3 pt-10 max-[560px]:gap-2.5 max-[560px]:pt-8'

const loginTextClassName =
  'text-[0.84rem] leading-none text-[#111] max-[560px]:text-[0.76rem]'

const loginLinkClassName =
  'inline-flex min-h-[40px] items-center justify-center border-[3px] border-[#111] bg-white px-[20px] text-[0.82rem] font-black text-[#111] shadow-[3px_3px_0_#111] transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_#111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/20 max-[560px]:min-h-[40px] max-[560px]:px-[16px] max-[560px]:text-[0.74rem] max-[560px]:shadow-[3px_3px_0_#111]'

const changeEmailRowClassName =
  'mb-[4px] flex items-center justify-between gap-3 max-[560px]:mb-1.5 max-[560px]:gap-2'

const changeEmailLabelClassName =
  'text-[0.94rem] font-black leading-none text-[#111] max-[560px]:text-[0.82rem]'

const changeEmailLinkClassName =
  'inline-flex items-center justify-center font-black text-[0.55rem] leading-none text-[#111] underline decoration-current decoration-[3px] underline-offset-[3px] [text-shadow:0.7px_0_0_#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/20 max-[560px]:text-[0.5rem]'

const legalLinkClassName =
  'font-black text-[#111] underline decoration-current underline-offset-[3px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/20'

const profileStatusClassName =
  'mt-2 min-h-[1.5em] text-center text-[0.78rem] font-bold text-[#127a3d] max-[560px]:text-[0.72rem]'

const profileLegalTextClassName =
  'mt-2.5 text-[0.68rem] leading-[1.42] text-[#111] max-[560px]:text-[0.64rem]'

const profileButtonClassName =
  'mb-2 !min-h-[34px] !shadow-[3px_3px_0_#111] max-[560px]:!min-h-[32px]'

const profileAccentBlackDotsClassName =
  'pointer-events-none absolute right-[202px] top-[96px] h-[52px] w-[52px] bg-[radial-gradient(circle,_#111_4px,_transparent_4px)] [background-size:16px_16px] opacity-95 max-[1100px]:right-[176px] max-[1100px]:top-[92px] max-[720px]:hidden'

const profileTopLeftAccentClassName =
  'pointer-events-none absolute left-0 top-[126px] h-[166px] w-[32px] bg-[#6b44e6] shadow-[5px_5px_0_rgba(17,17,17,0.14)] max-[1100px]:top-[116px] max-[1100px]:h-[146px] max-[1100px]:w-[30px] max-[720px]:hidden'

const profileTopRightDotsClassName =
  'pointer-events-none absolute right-[24px] top-[12px] h-[52px] w-[52px] bg-[radial-gradient(circle,_#111_4px,_transparent_4px)] [background-size:16px_16px] opacity-95 max-[720px]:h-[42px] max-[720px]:w-[42px] max-[720px]:[background-size:14px_14px]'

const profileTopRightStepClassName =
  'pointer-events-none absolute right-0 top-[68px] h-[98px] w-[104px] bg-[#111] [clip-path:polygon(100%_0,100%_16%,85%_16%,85%_32%,70%_32%,70%_48%,56%_48%,56%_64%,41%_64%,41%_80%,25%_80%,25%_100%,0_100%,0_0)] max-[1100px]:top-[62px] max-[1100px]:h-[92px] max-[1100px]:w-[96px] max-[720px]:hidden'

const profileRightPinkSquareClassName =
  'pointer-events-none absolute right-[20px] top-[192px] h-[32px] w-[32px] border-[3px] border-[#111] bg-[#ef587d] shadow-[4px_4px_0_#111] max-[1100px]:top-[176px] max-[720px]:hidden'

const profileRightDotMatrixClassName =
  'pointer-events-none absolute right-[20px] top-[282px] h-[68px] w-[52px] bg-[radial-gradient(circle,_#111_4px,_transparent_4px)] [background-size:16px_16px] opacity-95 max-[720px]:hidden'

const profileBottomRightGreenClassName =
  'pointer-events-none absolute right-0 bottom-0 h-[134px] w-[142px] bg-[#45c878] shadow-[5px_5px_0_#111] [clip-path:polygon(100%_0,100%_20%,84%_20%,84%_38%,68%_38%,68%_56%,52%_56%,52%_72%,36%_72%,36%_86%,20%_86%,20%_100%,0_100%,0_0)] max-[1100px]:h-[118px] max-[1100px]:w-[126px] max-[720px]:hidden'

const profileBottomLeftBlackClassName =
  'pointer-events-none absolute bottom-0 left-0 h-[80px] w-[108px] bg-[#111] [clip-path:polygon(0_66%,15%_66%,15%_48%,31%_48%,31%_32%,47%_32%,47%_18%,64%_18%,64%_8%,100%_8%,100%_100%,0_100%)] max-[720px]:hidden'

const profileBottomLeftYellowClassName =
  'pointer-events-none absolute bottom-0 left-0 h-[78px] w-[124px] bg-[#ffd93b] shadow-[5px_5px_0_#111] [clip-path:polygon(0_0,100%_0,100%_100%,66%_100%,66%_84%,48%_84%,48%_68%,32%_68%,32%_52%,16%_52%,16%_36%,0_36%)] max-[1100px]:h-[70px] max-[1100px]:w-[114px] max-[720px]:hidden'

const profileBottomCenterCircleClassName =
  'pointer-events-none absolute bottom-0 left-[192px] h-[74px] w-[74px] rounded-full bg-[#7048e8] shadow-[4px_4px_0_rgba(17,17,17,0.06)] max-[1100px]:left-[176px] max-[1100px]:h-[66px] max-[1100px]:w-[66px] max-[720px]:hidden'

const profileSmallPinkSquareClassName =
  'pointer-events-none absolute bottom-[60px] left-[330px] h-[24px] w-[24px] border-[3px] border-[#111] bg-[#ef587d] shadow-[3px_3px_0_#111] max-[1100px]:left-[284px] max-[720px]:hidden'

const profileLowerLeftDotsClassName =
  'pointer-events-none absolute bottom-[50px] left-[174px] h-[52px] w-[52px] bg-[radial-gradient(circle,_#111_4px,_transparent_4px)] [background-size:16px_16px] opacity-95 max-[1100px]:left-[156px] max-[720px]:hidden'

const accentBlackDotsClassName =
  'pointer-events-none absolute right-[252px] top-[126px] h-[68px] w-[68px] bg-[radial-gradient(circle,_#111_4px,_transparent_4px)] [background-size:18px_18px] opacity-95 max-[1100px]:right-[220px] max-[1100px]:top-[120px] max-[720px]:hidden'

const topLeftAccentClassName =
  'pointer-events-none absolute left-0 top-[160px] h-[218px] w-[40px] bg-[#6b44e6] shadow-[6px_6px_0_rgba(17,17,17,0.14)] max-[1100px]:top-[144px] max-[1100px]:h-[188px] max-[1100px]:w-[36px] max-[720px]:hidden'

const topRightDotsClassName =
  'pointer-events-none absolute right-[30px] top-[14px] h-[66px] w-[66px] bg-[radial-gradient(circle,_#111_4px,_transparent_4px)] [background-size:18px_18px] opacity-95 max-[720px]:h-[52px] max-[720px]:w-[52px] max-[720px]:[background-size:16px_16px]'

const topRightStepClassName =
  'pointer-events-none absolute right-0 top-[84px] h-[128px] w-[136px] bg-[#111] [clip-path:polygon(100%_0,100%_16%,85%_16%,85%_32%,70%_32%,70%_48%,56%_48%,56%_64%,41%_64%,41%_80%,25%_80%,25%_100%,0_100%,0_0)] max-[1100px]:top-[72px] max-[1100px]:h-[116px] max-[1100px]:w-[124px] max-[720px]:hidden'

const rightPinkSquareClassName =
  'pointer-events-none absolute right-[22px] top-[224px] h-[42px] w-[42px] border-[3px] border-[#111] bg-[#ef587d] shadow-[5px_5px_0_#111] max-[1100px]:top-[202px] max-[720px]:hidden'

const rightDotMatrixClassName =
  'pointer-events-none absolute right-[22px] top-[324px] h-[86px] w-[64px] bg-[radial-gradient(circle,_#111_4px,_transparent_4px)] [background-size:18px_18px] opacity-95 max-[720px]:hidden'

const bottomRightGreenClassName =
  'pointer-events-none absolute right-0 bottom-0 h-[176px] w-[186px] bg-[#45c878] shadow-[6px_6px_0_#111] [clip-path:polygon(100%_0,100%_20%,84%_20%,84%_38%,68%_38%,68%_56%,52%_56%,52%_72%,36%_72%,36%_86%,20%_86%,20%_100%,0_100%,0_0)] max-[1100px]:h-[150px] max-[1100px]:w-[160px] max-[720px]:hidden'

const bottomLeftBlackClassName =
  'pointer-events-none absolute bottom-0 left-[0px] h-[104px] w-[142px] bg-[#111] [clip-path:polygon(0_66%,15%_66%,15%_48%,31%_48%,31%_32%,47%_32%,47%_18%,64%_18%,64%_8%,100%_8%,100%_100%,0_100%)] max-[720px]:hidden'

const bottomLeftYellowClassName =
  'pointer-events-none absolute bottom-0 left-0 h-[102px] w-[166px] bg-[#ffd93b] shadow-[6px_6px_0_#111] [clip-path:polygon(0_0,100%_0,100%_100%,66%_100%,66%_84%,48%_84%,48%_68%,32%_68%,32%_52%,16%_52%,16%_36%,0_36%)] max-[1100px]:h-[92px] max-[1100px]:w-[150px] max-[720px]:hidden'

const bottomCenterCircleClassName =
  'pointer-events-none absolute bottom-0 left-[252px] h-[98px] w-[98px] rounded-full bg-[#7048e8] shadow-[5px_5px_0_rgba(17,17,17,0.06)] max-[1100px]:left-[226px] max-[1100px]:h-[88px] max-[1100px]:w-[88px] max-[720px]:hidden'

const smallPinkSquareClassName =
  'pointer-events-none absolute bottom-[78px] left-[420px] h-[32px] w-[32px] border-[3px] border-[#111] bg-[#ef587d] shadow-[4px_4px_0_#111] max-[1100px]:left-[360px] max-[720px]:hidden'

const lowerLeftDotsClassName =
  'pointer-events-none absolute bottom-[68px] left-[230px] h-[68px] w-[68px] bg-[radial-gradient(circle,_#111_4px,_transparent_4px)] [background-size:18px_18px] opacity-95 max-[1100px]:left-[204px] max-[720px]:hidden'

function validate(values) {
  const errors = {}

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  return errors
}

function validateProfile(values) {
  const errors = {}

  if (!values.fullName.trim()) {
    errors.fullName = 'Full name is required.'
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = 'Enter at least 2 characters.'
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export default function SignUpPage() {
  const [value, setValue] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  })
  const [touched, setTouched] = useState({
    email: false,
    fullName: false,
    password: false,
    confirmPassword: false,
  })
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [attemptedProfileSubmit, setAttemptedProfileSubmit] = useState(false)
  const [step, setStep] = useState('email')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpMessage, setOtpMessage] = useState('')
  const [otpMessageTone, setOtpMessageTone] = useState('default')
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('')
  const [profileStatusMessage, setProfileStatusMessage] = useState('')
  const isProfileStep = step === 'profile'

  const errors = validate(value)
  const profileErrors = validateProfile(value)
  const showEmailError = step === 'email' && (attemptedSubmit || touched.email) && errors.email
  const showFullNameError =
    step === 'profile' && (attemptedProfileSubmit || touched.fullName) && profileErrors.fullName
  const showProfileEmailError =
    step === 'profile' && attemptedProfileSubmit && profileErrors.email
  const showPasswordError =
    step === 'profile' && (attemptedProfileSubmit || touched.password) && profileErrors.password
  const showConfirmPasswordError =
    step === 'profile' &&
    (attemptedProfileSubmit || touched.confirmPassword) &&
    profileErrors.confirmPassword

  const handleChange = (event) => {
    const { name, value: nextValue } = event.target

    setValue((current) => ({
      ...current,
      [name]: nextValue,
    }))

    if (name === 'email' && step === 'otp') {
      setOtp(['', '', '', '', '', ''])
      setOtpMessage('')
      setOtpMessageTone('default')
    }

    if (step === 'profile') {
      setProfileStatusMessage('')
    }
  }

  const handleBlur = (event) => {
    const { name } = event.target

    setTouched((current) => ({
      ...current,
      [name]: true,
    }))
  }

  const handleSendOtp = () => {
    setAttemptedSubmit(true)

    if (validate({ email: value.email }).email) {
      return
    }

    setStep('otp')
    setOtp(['', '', '', '', '', ''])
    setOtpMessage('')
    setOtpMessageTone('default')
  }

  const handleVerifyOtp = () => {
    const complete = otp.every((digit) => /^\d$/.test(digit))

    if (!complete) {
      setOtpMessage('Please enter all 6 digits before continuing.')
      setOtpMessageTone('error')
      return
    }

    setStep('profile')
    setOtp(['', '', '', '', '', ''])
    setOtpMessage('')
    setOtpMessageTone('default')
  }

  const handleChangeEmail = () => {
    setStep('email')
    setOtp(['', '', '', '', '', ''])
    setOtpMessage('')
    setOtpMessageTone('default')
  }

  const handleProfilePhotoChange = ({ file, previewUrl }) => {
    setProfilePhoto(file)
    setProfilePhotoPreview(previewUrl)
    setProfileStatusMessage('')
  }

  const handleCompleteSignup = () => {
    setAttemptedProfileSubmit(true)

    if (Object.keys(validateProfile(value)).length > 0) {
      setProfileStatusMessage('')
      return
    }

    setProfileStatusMessage('Account details validated. Connect this to the registration API next.')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (step === 'email') {
      handleSendOtp()
      return
    }

    if (step === 'otp') {
      handleVerifyOtp()
      return
    }

    handleCompleteSignup()
  }

  const buttonLabel = step === 'otp' ? 'SUBMIT OTP' : 'SIGN UP'

  const handleOtpChange = (nextOtp) => {
    setOtp(nextOtp)
    setOtpMessage('')
    setOtpMessageTone('default')
  }

  const handleOtpComplete = (completedOtp) => {
    setOtp(completedOtp.split(''))
    setOtpMessage('')
    setOtpMessageTone('default')
  }

  return (
    <div className={isProfileStep ? profilePageClassName : pageClassName}>
      <div
        aria-hidden="true"
        className={isProfileStep ? profileTopRightDotsClassName : topRightDotsClassName}
      />
      <div
        aria-hidden="true"
        className={isProfileStep ? profileTopRightStepClassName : topRightStepClassName}
      />
      <div
        aria-hidden="true"
        className={isProfileStep ? profileRightPinkSquareClassName : rightPinkSquareClassName}
      />
      <div
        aria-hidden="true"
        className={isProfileStep ? profileRightDotMatrixClassName : rightDotMatrixClassName}
      />
      <div
        aria-hidden="true"
        className={isProfileStep ? profileBottomRightGreenClassName : bottomRightGreenClassName}
      />
      <div
        aria-hidden="true"
        className={isProfileStep ? profileBottomLeftYellowClassName : bottomLeftYellowClassName}
      />
      <div
        aria-hidden="true"
        className={isProfileStep ? profileBottomLeftBlackClassName : bottomLeftBlackClassName}
      />
      <div
        aria-hidden="true"
        className={isProfileStep ? profileBottomCenterCircleClassName : bottomCenterCircleClassName}
      />
      <div
        aria-hidden="true"
        className={isProfileStep ? profileSmallPinkSquareClassName : smallPinkSquareClassName}
      />
      <div
        aria-hidden="true"
        className={isProfileStep ? profileLowerLeftDotsClassName : lowerLeftDotsClassName}
      />
      <div
        aria-hidden="true"
        className={isProfileStep ? profileTopLeftAccentClassName : topLeftAccentClassName}
      />
      <div
        aria-hidden="true"
        className={isProfileStep ? profileAccentBlackDotsClassName : accentBlackDotsClassName}
      />

      <main className={isProfileStep ? profileShellClassName : shellClassName}>
        <BrandLogo density={isProfileStep ? 'profile' : 'compact'} />

        <section
          className={isProfileStep ? profileSignUpSectionClassName : signUpSectionClassName}
          aria-label="Sign up area"
        >
          <div className="max-[1100px]:translate-x-0 translate-x-[14px]">
            <HeroPanel variant="signup" density={isProfileStep ? 'profile' : 'compact'} />
          </div>

          <BrutalistCard
            className={
              isProfileStep
                ? 'w-full !p-2.5 !shadow-[5px_5px_0_#111]'
                : 'w-full -translate-x-[54px] max-[1000px]:translate-x-0'
            }
            density={isProfileStep ? 'profile' : 'compact'}
          >
            <div className={isProfileStep ? profileCardInnerClassName : cardInnerClassName}>
              <h1 className={isProfileStep ? profileHeadingClassName : headingClassName}>SIGN UP</h1>
              <p className={isProfileStep ? profileSubtitleClassName : subtitleClassName}>
                Create your account to get started.
              </p>

              {!isProfileStep ? (
                <>
                  <GoogleButton
                    text="Sign up with Google"
                    density="compact"
                    className="min-h-[48px] max-[560px]:min-h-[44px]"
                  />

                  <div className={dividerClassName} aria-hidden="true">
                    <span className={dividerLineClassName} />
                    <strong className={dividerTextClassName}>OR</strong>
                    <span className={dividerLineClassName} />
                  </div>
                </>
              ) : null}

              <form className="relative z-10 flex flex-1 flex-col" onSubmit={handleSubmit} noValidate>
                <div className={isProfileStep ? 'flex flex-1 flex-col' : 'flex flex-col gap-[14px] max-[560px]:gap-3'}>
                  {step === 'otp' ? (
                    <div className="mb-[8px] max-[560px]:mb-2">
                      <div className={changeEmailRowClassName}>
                        <label
                          htmlFor="email"
                          className={changeEmailLabelClassName}
                        >
                          Email
                        </label>
                        <button
                          type="button"
                          onClick={handleChangeEmail}
                          className={changeEmailLinkClassName}
                        >
                          Change Email
                        </button>
                      </div>

                      <InputField
                        id="email"
                        name="email"
                        label="Email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="Enter your email"
                        value={value.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        icon={Mail}
                      error={showEmailError ? errors.email : ''}
                      density="compact"
                      labelClassName="sr-only"
                        className="min-h-[52px] max-[560px]:min-h-[46px]"
                      />
                    </div>
                  ) : step === 'email' ? (
                    <InputField
                      id="email"
                      name="email"
                      label="Email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={value.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      icon={Mail}
                    error={showEmailError ? errors.email : ''}
                    density="compact"
                    className="min-h-[52px] max-[560px]:min-h-[46px]"
                  />
                  ) : (
                    <>
                      <ProfilePhotoUploader
                        previewUrl={profilePhotoPreview}
                        selectedFileName={profilePhoto?.name}
                        onChange={handleProfilePhotoChange}
                        density="profile"
                      />

                      <InputField
                        id="fullName"
                        name="fullName"
                        label="Full Name"
                        type="text"
                        autoComplete="name"
                        placeholder="Enter your full name"
                        value={value.fullName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        icon={User}
                        error={showFullNameError ? profileErrors.fullName : ''}
                        density="profile"
                      />

                      <InputField
                        id="profile-email"
                        name="email"
                        label="Email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="Enter your email"
                        value={value.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        icon={Mail}
                        endIcon={Lock}
                        readOnly
                        error={showProfileEmailError ? profileErrors.email : ''}
                        density="profile"
                      />

                      <PasswordField
                        id="password"
                        name="password"
                        label="Password"
                        autoComplete="new-password"
                        placeholder="Create a password"
                        value={value.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={showPasswordError ? profileErrors.password : ''}
                        density="profile"
                      />

                      <PasswordField
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirm Password"
                        autoComplete="new-password"
                        placeholder="Confirm your password"
                        value={value.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={showConfirmPasswordError ? profileErrors.confirmPassword : ''}
                        density="profile"
                      />
                    </>
                  )}

                  {step === 'otp' ? (
                    <>
                      <OtpInput
                        value={otp}
                        onChange={handleOtpChange}
                        onComplete={handleOtpComplete}
                        helperText="Enter the 6-digit code sent to your email"
                        error={otpMessageTone === 'error' ? otpMessage : ''}
                        className="mb-1"
                      />

                      {otpMessage && otpMessageTone === 'success' ? (
                        <p
                          className="text-[0.74rem] font-bold text-[#127a3d] max-[560px]:text-[0.7rem]"
                          role="status"
                          aria-live="polite"
                        >
                          {otpMessage}
                        </p>
                      ) : null}
                    </>
                  ) : null}

                  <BrutalistButton
                    type="submit"
                    variant="primary"
                    icon={<ArrowRight size={isProfileStep ? 20 : 24} aria-hidden="true" />}
                    density={isProfileStep ? 'profile' : 'compact'}
                    className={
                      isProfileStep
                        ? profileButtonClassName
                        : 'mb-0 min-h-[52px] max-[560px]:min-h-[48px]'
                    }
                  >
                    <span className="font-black">{buttonLabel}</span>
                  </BrutalistButton>
                </div>

                {isProfileStep ? (
                  <>
                    <p className={profileLegalTextClassName}>
                      By signing up, you agree to our{' '}
                      <a href="#terms-of-service" className={legalLinkClassName}>
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#privacy-policy" className={legalLinkClassName}>
                        Privacy Policy
                      </a>
                      .
                    </p>

                    <p className={profileStatusClassName} role="status" aria-live="polite">
                      {profileStatusMessage}
                    </p>
                  </>
                ) : (
                  <div className={loginRowClassName}>
                    <p className={loginTextClassName}>Already have an account?</p>
                    <Link to="/login" className={loginLinkClassName}>
                      Log in
                    </Link>
                  </div>
                )}
              </form>
            </div>
          </BrutalistCard>
        </section>
      </main>
    </div>
  )
}
