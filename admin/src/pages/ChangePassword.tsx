import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Lock, AlertCircle, Check, Shield, Eye, EyeOff } from 'lucide-react'

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const { changePassword, error } = useAuth()
  const navigate = useNavigate()

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    return { minLength, hasUpper, hasLower, hasNumber, hasSpecial }
  }

  const validation = validatePassword(newPassword)
  const allValid = Object.values(validation).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) return
    if (!allValid) return

    try {
      await changePassword(currentPassword, newPassword)
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (err) {
      // Error handled in context
    }
  }

  if (success) {
    return (
      <div className="min-h-screen w-full flex relative overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920&h=1080&fit=crop"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Success Card */}
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Changed!</h2>
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden">
      {/* Full Screen Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1920&h=1080&fit=crop"
          alt="Logistics Background"
          className="w-full h-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/60" />
      </div>

      {/* Left Side - Brand Content */}
      <div className="hidden lg:flex flex-1 relative z-10 flex-col justify-center px-16">
        <div className="max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#1677ff] rounded-xl flex items-center justify-center shadow-lg shadow-[#1677ff]/30">
              <Shield className="text-white" size={28} />
            </div>
            <span className="text-2xl font-bold text-white">Indigenex</span>
          </div>

          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Security
            <span className="text-[#1677ff]"> First</span>
          </h1>

          <p className="text-lg text-white/80 leading-relaxed">
            Please change your password to secure your account.
            A strong password helps protect your data.
          </p>
        </div>
      </div>

      {/* Right Side - Change Password Card */}
      <div className="flex-1 lg:flex-none lg:w-[480px] relative z-10 flex items-center justify-center p-6">
        {/* Glass Card */}
        <div className="w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#1677ff] rounded-lg flex items-center justify-center">
              <Shield className="text-white" size={22} />
            </div>
            <span className="text-xl font-bold text-gray-900">Indigenex</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h2>
            <p className="text-sm text-gray-500">Set a new secure password to continue</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Change Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm transition-all focus:bg-white focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff]/10 outline-none"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm transition-all focus:bg-white focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff]/10 outline-none"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-12 pl-11 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm transition-all focus:bg-white focus:border-[#1677ff] focus:ring-2 focus:ring-[#1677ff]/10 outline-none"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-2 text-sm text-red-500">Passwords do not match</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Password requirements:</p>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'At least 8 characters', valid: validation.minLength },
                  { label: 'One uppercase letter', valid: validation.hasUpper },
                  { label: 'One lowercase letter', valid: validation.hasLower },
                  { label: 'One number', valid: validation.hasNumber },
                  { label: 'One special character', valid: validation.hasSpecial },
                ].map((req) => (
                  <li key={req.label} className={`flex items-center gap-2 ${req.valid ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${req.valid ? 'bg-green-100' : 'bg-gray-200'}`}>
                      <Check size={12} className={req.valid ? 'opacity-100' : 'opacity-0'} />
                    </div>
                    {req.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!allValid || newPassword !== confirmPassword}
              className="w-full h-12 bg-[#1677ff] hover:bg-[#4096ff] active:bg-[#0958d9] text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-[#1677ff]/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
