import { ArrowRight, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import BrutalistButton from './BrutalistButton.jsx'
import GoogleButton from './GoogleButton.jsx'
import InputField from './InputField.jsx'
import PasswordField from './PasswordField.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

const initialValues = {
  email: '',
  password: '',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values) {
  const errors = {}

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  return errors
}

export default function LoginForm() {
    const { user, googleSignIn, githubSignIn, setLocaluser } = useAuth();
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  })
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const errors = validate(values)
  const showEmailError = (attemptedSubmit || touched.email) && errors.email
  const showPasswordError = (attemptedSubmit || touched.password) && errors.password

  const handleChange = (event) => {
    const { name, value } = event.target

    setValues((current) => ({
      ...current,
      [name]: value,
    }))

    if (statusMessage) {
      setStatusMessage('')
    }
  }

  const handleBlur = (event) => {
    const { name } = event.target

    setTouched((current) => ({
      ...current,
      [name]: true,
    }))
  }
const  handlegoolebtnclick=async()=>{
   const data = await googleSignIn();
      console.log(data.user.email)
}
  const handleSubmit = (event) => {
    event.preventDefault()
    setAttemptedSubmit(true)

    if (Object.keys(errors).length > 0) {
      setStatusMessage('')
      return
    }

    setStatusMessage('Form validated. Connect this page to your auth flow next.')
  }

  const handlePlaceholderAction = (message) => (event) => {
    event.preventDefault()
    setStatusMessage(message)
  }

  return (
    <>
      <h2
        id="login-title"
        className="relative z-10 mt-1 mb-2.5 w-fit border-[3px] border-[#111] bg-gradient-to-b from-[#a88cff] to-[#8f6fff] px-[14px] py-[9px] text-[1.7rem] font-black leading-none tracking-[-0.08em] text-[#111] shadow-[5px_5px_0_#111] max-[720px]:mt-[2px] max-[720px]:mb-[9px] max-[720px]:px-[13px] max-[720px]:py-2 max-[720px]:text-[1.45rem] max-[720px]:shadow-[5px_5px_0_#111] max-[560px]:text-[1.25rem] max-[560px]:shadow-[4px_4px_0_#111]"
      >
        WELCOME BACK
      </h2>
      <p className="relative z-10 mb-[15px] mt-[7px] text-[clamp(0.92rem,0.98vw,1.05rem)] leading-[1.45] text-[#111] max-[720px]:mb-4 max-[720px]:mt-[7px] max-[720px]:text-[0.9rem] max-[560px]:mb-3.5 max-[560px]:mt-[6px] max-[560px]:text-[0.84rem]">
        Log in to continue your journey
      </p>

      <form className="relative z-10 flex flex-1 flex-col" onSubmit={handleSubmit} noValidate>
        <InputField
          id="email"
          name="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Enter your email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          icon={Mail}
          error={showEmailError ? errors.email : ''}
        />

        <PasswordField
          id="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={showPasswordError ? errors.password : ''}
        />

        <div className="mb-3 flex justify-end max-[720px]:mb-3 max-[560px]:mb-[10px]">
          <a
            href="#forgot-password"
            onClick={handlePlaceholderAction('Password reset is not wired up yet.')}
            className="font-black text-[#111] underline decoration-current underline-offset-[3px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/20"
          >
            Forgot Password?
          </a>
        </div>

        <BrutalistButton type="submit" variant="primary">
          <span>LOG IN</span>
          <ArrowRight size={32} aria-hidden="true" />
        </BrutalistButton>

        <div className="my-4 flex items-center gap-5 max-[720px]:my-[14px] max-[720px]:gap-3 max-[560px]:my-[12px] max-[560px]:gap-2.5">
          <span className="h-[2px] flex-1 bg-[rgba(17,17,17,0.55)]" />
          <strong className="text-[1.1rem] font-black max-[720px]:text-[0.9rem] max-[560px]:text-[0.8rem]">
            OR
          </strong>
          <span className="h-[2px] flex-1 bg-[rgba(17,17,17,0.55)]" />
        </div>

       <button onClick={handlegoolebtnclick}><GoogleButton text="Continue with Google" /></button> 

        <p className="mt-3 text-center text-[0.88rem] max-[720px]:mt-[11px] max-[720px]:text-[0.86rem] max-[560px]:mt-[9px] max-[560px]:text-[0.8rem]">
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="font-black text-[#111] underline decoration-current underline-offset-[3px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/20"
          >
            Sign up
          </Link>
        </p>

        <p
          className="mt-2.5 min-h-[1.5em] text-center text-[0.86rem] font-bold text-[#111] max-[720px]:mt-2 max-[720px]:text-[0.8rem] max-[560px]:mt-1.5 max-[560px]:text-[0.75rem]"
          aria-live="polite"
        >
          {statusMessage}
        </p>
      </form>
    </>
  )
}
