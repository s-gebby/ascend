import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { app } from "../../firebaseConfig"
import { writeUserData } from "../../utils/database"

const PasswordRequirements = ({ show }) => {
  if (!show) return null

  return (
    <div className="absolute z-10 mt-2 p-4 bg-white border border-gray-300 rounded-md shadow-lg">
      <ul className="text-sm text-gray-600">Password must be:
        <li>1. At least 6 characters long</li>
        <li>2. Contain at least one uppercase letter</li>
        <li>3. Contain at least one numerical character</li>
        </ul>
    </div>
  )
}

{/* 
  ADD IN PASSWORD STRENGTH CHECKER
  ADD IN PASSWORD MATCH CHECKER 
*/}

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const navigate = useNavigate()
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)



  const handleSignUp = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("Passwords don't match")
      return
    }
    try {
      const auth = getAuth(app)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      await writeUserData(user.uid, user.email.split('@')[0], user.email)
      navigate("/onboarding")
    } catch (error) {
      alert(error.message)
    }
  }
  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <Link to="/" className="absolute top-4 left-4 text-black">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Create your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
              <div className="mt-2">
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setShowPasswordRequirements(true)}
                    onBlur={() => setShowPasswordRequirements(false)}
                  />
                  <PasswordRequirements show={showPasswordRequirements} />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium leading-6 text-gray-900">
                Confirm Password
              </label>
              <div className="mt-2">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white hover:text-black hover:border hover:border-black"
              >
                Sign up
              </button>
            </div>
          </form>
          <p className="mt-10 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold leading-6 text-green-600 hover:text-green-500">
              Sign in
            </Link>
          </p>
        </div>
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What you're signing up for:
          </h3>
          <div className="inline-block text-left rounded-lg p-6 shadow-sm">
            <div className="flex justify-center">
              <ul className="mr-8">
                {[
                  "Goal Creation and Breakdown",
                  "Progress Tracking & Visualizations",
                  "Personalized Insights & Motivation",
                  "Reminders & Notifications",
                  "Community & Social Features",
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700 mb-2">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <ul>
                {[
                  "Personalization & Customization",
                  "Mindfulness & Well-Being Integration",
                  "Rewards & Gamification",
                  "Secure & Private Reflection Space",
                  "AI-Powered Goal Recommendations"
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700 mb-2">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
