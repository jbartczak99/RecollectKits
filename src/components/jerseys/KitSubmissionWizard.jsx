import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRightIcon,
  ClipboardDocumentListIcon,
  PhotoIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext.jsx'

// Separate form components to prevent re-creation on renders
const ClubKitBasicInfoForm = ({ formData, handleFormChange, nextStep, prevStep, currentStep, stepsLength }) => (
  <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md">
    {/* Header */}
    <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Club Kit Details</h1>
        <p className="text-lg opacity-90">
          Tell us about this club kit
        </p>
      </div>
    </div>

    {/* Form */}
    <div className="p-8">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Club Name */}
          <div>
            <label htmlFor="club_name" className="block text-sm font-medium text-gray-700 mb-2">
              Club Name *
            </label>
            <input
              type="text"
              id="club_name"
              name="club_name"
              value={formData.club_name || ''}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Manchester United"
            />
          </div>

          {/* Season */}
          <div>
            <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-2">
              Season *
            </label>
            <input
              type="text"
              id="season"
              name="season"
              value={formData.season || ''}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="2023-24"
            />
          </div>
        </div>

        {/* Competition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Competition *
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '15px' }}>
              <input
                type="radio"
                name="competition_gender"
                value="mens"
                checked={formData.competition_gender === 'mens'}
                onChange={handleFormChange}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  border: formData.competition_gender === 'mens' ? '2px solid #7C3AED' : '2px solid #D1D5DB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 0.2s'
                }}
              >
                {formData.competition_gender === 'mens' && (
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#7C3AED' }} />
                )}
              </span>
              <span style={{ color: formData.competition_gender === 'mens' ? '#1F2937' : '#6B7280', fontWeight: formData.competition_gender === 'mens' ? 600 : 400 }}>
                Men's
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '15px' }}>
              <input
                type="radio"
                name="competition_gender"
                value="womens"
                checked={formData.competition_gender === 'womens'}
                onChange={handleFormChange}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  border: formData.competition_gender === 'womens' ? '2px solid #7C3AED' : '2px solid #D1D5DB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 0.2s'
                }}
              >
                {formData.competition_gender === 'womens' && (
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#7C3AED' }} />
                )}
              </span>
              <span style={{ color: formData.competition_gender === 'womens' ? '#1F2937' : '#6B7280', fontWeight: formData.competition_gender === 'womens' ? 600 : 400 }}>
                Women's
              </span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* League */}
          <div>
            <label htmlFor="league" className="block text-sm font-medium text-gray-700 mb-2">
              League *
            </label>
            <select
              id="league"
              name="league"
              value={formData.league || ''}
              onChange={handleFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select a league</option>
              {formData.competition_gender === 'womens' ? (
                <>
                  <option value="NWSL">NWSL</option>
                  <option value="USL Super League">USL Super League</option>
                  <option value="WSL">WSL</option>
                  <option value="Liga F">Liga F</option>
                  <option value="Serie A Femminile">Serie A Femminile</option>
                  <option value="Frauen-Bundesliga">Frauen-Bundesliga</option>
                  <option value="D1 Arkema">D1 Arkema</option>
                  <option value="A-League Women">A-League Women</option>
                  <option value="Other">Other</option>
                </>
              ) : (
                <>
                  <option value="Premier League">Premier League</option>
                  <option value="La Liga">La Liga</option>
                  <option value="Serie A">Serie A</option>
                  <option value="Bundesliga">Bundesliga</option>
                  <option value="Ligue 1">Ligue 1</option>
                  <option value="MLS">MLS</option>
                  <option value="Eredivisie">Eredivisie</option>
                  <option value="Liga Portugal">Liga Portugal</option>
                  <option value="Championship">Championship</option>
                  <option value="Saudi Pro League">Saudi Pro League</option>
                  <option value="Other">Other</option>
                </>
              )}
            </select>
          </div>

          {/* Kit Type */}
          <div>
            <label htmlFor="kit_type" className="block text-sm font-medium text-gray-700 mb-2">
              Kit Type *
            </label>
            <select
              id="kit_type"
              name="kit_type"
              value={formData.kit_type || 'home'}
              onChange={handleFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="home">Home</option>
              <option value="away">Away</option>
              <option value="third">Third</option>
              <option value="special">Special Edition</option>
            </select>
          </div>
        </div>

        {/* Other League Input - Conditional */}
        {formData.league === 'Other' && (
          <div>
            <label htmlFor="league_other" className="block text-sm font-medium text-gray-700 mb-2">
              Specify League *
            </label>
            <input
              type="text"
              id="league_other"
              name="league_other"
              value={formData.league_other || ''}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter league name"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player Name (Optional) */}
          <div>
            <label htmlFor="player_name" className="block text-sm font-medium text-gray-700 mb-2">
              Player Name (Optional)
            </label>
            <input
              type="text"
              id="player_name"
              name="player_name"
              value={formData.player_name || ''}
              onChange={handleFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Cristiano Ronaldo"
            />
          </div>

          {/* Player Number (Optional) */}
          <div>
            <label htmlFor="player_number" className="block text-sm font-medium text-gray-700 mb-2">
              Player Number (Optional)
            </label>
            <input
              type="number"
              id="player_number"
              name="player_number"
              value={formData.player_number || ''}
              onChange={handleFormChange}
              min="1"
              max="99"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="7"
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 -mt-4">
          Leave blank for a blank kit or enter the player details if this is a player-specific jersey
        </p>
      </div>

      {/* Navigation */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            ← Back
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {stepsLength}
          </div>

          <button
            onClick={nextStep}
            disabled={
              !formData.club_name ||
              !formData.season ||
              !formData.league ||
              (formData.league === 'Other' && !formData.league_other)
            }
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  </div>
)

const ClubKitDetailsForm = ({ formData, handleFormChange, nextStep, prevStep, currentStep, stepsLength }) => (
  <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md">
    {/* Header */}
    <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Kit Details</h1>
        <p className="text-lg opacity-90">
          Add additional information about this kit
        </p>
      </div>
    </div>

    {/* Form */}
    <div className="p-8">
      <div className="space-y-6">
        {/* Manufacturer */}
        <div>
          <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-2">
            Manufacturer *
          </label>
          <select
            id="manufacturer"
            name="manufacturer"
            value={formData.manufacturer || ''}
            onChange={handleFormChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Select manufacturer</option>
            <option value="Adidas">Adidas</option>
            <option value="Nike">Nike</option>
            <option value="Puma">Puma</option>
            <option value="Umbro">Umbro</option>
            <option value="New Balance">New Balance</option>
            <option value="Joma">Joma</option>
            <option value="Kappa">Kappa</option>
            <option value="Macron">Macron</option>
            <option value="Hummel">Hummel</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Color */}
          <div>
            <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <input
              type="text"
              id="primary_color"
              name="primary_color"
              value={formData.primary_color || ''}
              onChange={handleFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Red"
            />
          </div>

          {/* Secondary Color */}
          <div>
            <label htmlFor="secondary_color" className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <input
              type="text"
              id="secondary_color"
              name="secondary_color"
              value={formData.secondary_color || ''}
              onChange={handleFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="White"
            />
          </div>
        </div>

        {/* Main Sponsor */}
        <div>
          <label htmlFor="main_sponsor" className="block text-sm font-medium text-gray-700 mb-2">
            Main Sponsor
          </label>
          <input
            type="text"
            id="main_sponsor"
            name="main_sponsor"
            value={formData.main_sponsor || ''}
            onChange={handleFormChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Emirates"
          />
        </div>

        {/* Additional Sponsors */}
        <div>
          <label htmlFor="additional_sponsors" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Sponsors
          </label>
          <input
            type="text"
            id="additional_sponsors"
            name="additional_sponsors"
            value={formData.additional_sponsors || ''}
            onChange={handleFormChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Visit Rwanda, Mastercard (separate with commas)"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter multiple sponsors separated by commas
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleFormChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
            placeholder="Additional details about this kit (special features, commemorative information, etc.)"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            ← Back
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {stepsLength}
          </div>

          <button
            onClick={nextStep}
            disabled={!formData.manufacturer}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  </div>
)

const InternationalKitBasicInfoForm = ({ formData, handleFormChange, nextStep, prevStep, currentStep, stepsLength }) => (
  <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md">
    {/* Header */}
    <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">International Kit Details</h1>
        <p className="text-lg opacity-90">
          Tell us about this national team kit
        </p>
      </div>
    </div>

    {/* Form */}
    <div className="p-8">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country Name */}
          <div>
            <label htmlFor="country_name" className="block text-sm font-medium text-gray-700 mb-2">
              Country/Territory *
            </label>
            <input
              type="text"
              id="country_name"
              name="country_name"
              value={formData.country_name || ''}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="England"
            />
          </div>

          {/* Season/Year */}
          <div>
            <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-2">
              Season/Year *
            </label>
            <input
              type="text"
              id="season"
              name="season"
              value={formData.season || ''}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="2024"
            />
          </div>
        </div>

        {/* Competition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Competition *
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '15px' }}>
              <input
                type="radio"
                name="competition_gender"
                value="mens"
                checked={formData.competition_gender === 'mens'}
                onChange={handleFormChange}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  border: formData.competition_gender === 'mens' ? '2px solid #7C3AED' : '2px solid #D1D5DB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 0.2s'
                }}
              >
                {formData.competition_gender === 'mens' && (
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#7C3AED' }} />
                )}
              </span>
              <span style={{ color: formData.competition_gender === 'mens' ? '#1F2937' : '#6B7280', fontWeight: formData.competition_gender === 'mens' ? 600 : 400 }}>
                Men's
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: '15px' }}>
              <input
                type="radio"
                name="competition_gender"
                value="womens"
                checked={formData.competition_gender === 'womens'}
                onChange={handleFormChange}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  border: formData.competition_gender === 'womens' ? '2px solid #7C3AED' : '2px solid #D1D5DB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 0.2s'
                }}
              >
                {formData.competition_gender === 'womens' && (
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#7C3AED' }} />
                )}
              </span>
              <span style={{ color: formData.competition_gender === 'womens' ? '#1F2937' : '#6B7280', fontWeight: formData.competition_gender === 'womens' ? 600 : 400 }}>
                Women's
              </span>
            </label>
          </div>
        </div>

        {/* Kit Type */}
        <div>
          <label htmlFor="kit_type" className="block text-sm font-medium text-gray-700 mb-2">
            Kit Type *
          </label>
          <select
            id="kit_type"
            name="kit_type"
            value={formData.kit_type || 'home'}
            onChange={handleFormChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="home">Home</option>
            <option value="away">Away</option>
            <option value="third">Third</option>
            <option value="goalkeeper">Goalkeeper</option>
            <option value="special">Special Edition</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player Name (Optional) */}
          <div>
            <label htmlFor="player_name" className="block text-sm font-medium text-gray-700 mb-2">
              Player Name (Optional)
            </label>
            <input
              type="text"
              id="player_name"
              name="player_name"
              value={formData.player_name || ''}
              onChange={handleFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Harry Kane"
            />
          </div>

          {/* Player Number (Optional) */}
          <div>
            <label htmlFor="player_number" className="block text-sm font-medium text-gray-700 mb-2">
              Player Number (Optional)
            </label>
            <input
              type="number"
              id="player_number"
              name="player_number"
              value={formData.player_number || ''}
              onChange={handleFormChange}
              min="1"
              max="99"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="9"
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 -mt-4">
          Leave blank for a blank kit or enter the player details if this is a player-specific jersey
        </p>
      </div>

      {/* Navigation */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            ← Back
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {stepsLength}
          </div>

          <button
            onClick={nextStep}
            disabled={
              !formData.country_name ||
              !formData.season
            }
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  </div>
)

const InternationalKitDetailsForm = ({ formData, handleFormChange, nextStep, prevStep, currentStep, stepsLength }) => (
  <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md">
    {/* Header */}
    <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">International Kit Details</h1>
        <p className="text-lg opacity-90">
          Add additional information about this national team kit
        </p>
      </div>
    </div>

    {/* Form */}
    <div className="p-8">
      <div className="space-y-6">
        {/* Manufacturer */}
        <div>
          <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-2">
            Manufacturer *
          </label>
          <select
            id="manufacturer"
            name="manufacturer"
            value={formData.manufacturer || ''}
            onChange={handleFormChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Select manufacturer</option>
            <option value="Adidas">Adidas</option>
            <option value="Nike">Nike</option>
            <option value="Puma">Puma</option>
            <option value="Umbro">Umbro</option>
            <option value="New Balance">New Balance</option>
            <option value="Joma">Joma</option>
            <option value="Kappa">Kappa</option>
            <option value="Macron">Macron</option>
            <option value="Hummel">Hummel</option>
            <option value="Erreà">Erreà</option>
            <option value="Lotto">Lotto</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Color */}
          <div>
            <label htmlFor="primary_color" className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <input
              type="text"
              id="primary_color"
              name="primary_color"
              value={formData.primary_color || ''}
              onChange={handleFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="White"
            />
          </div>

          {/* Secondary Color */}
          <div>
            <label htmlFor="secondary_color" className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <input
              type="text"
              id="secondary_color"
              name="secondary_color"
              value={formData.secondary_color || ''}
              onChange={handleFormChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Blue"
            />
          </div>
        </div>

        {/* Competition/Tournament */}
        <div>
          <label htmlFor="tournament" className="block text-sm font-medium text-gray-700 mb-2">
            Competition/Tournament
          </label>
          <input
            type="text"
            id="tournament"
            name="tournament"
            value={formData.tournament || ''}
            onChange={handleFormChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="FIFA World Cup 2024"
          />
          <p className="mt-1 text-sm text-gray-500">
            Specify the competition or tournament this kit was used for
          </p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleFormChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
            placeholder="Additional details about this kit (special features, commemorative information, historical significance, etc.)"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            ← Back
          </button>

          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {stepsLength}
          </div>

          <button
            onClick={nextStep}
            disabled={!formData.manufacturer}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  </div>
)

const KitReviewForm = ({ formData, handleFormChange, nextStep, prevStep, currentStep, stepsLength, kitType, onSubmitSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      if (!user) {
        throw new Error('You must be logged in to submit a kit')
      }

      // Upload images to Supabase storage first
      const frontImageUrl = await uploadImage(formData.front_image, 'front')
      const backImageUrl = await uploadImage(formData.back_image, 'back')

      // Upload additional images
      const additionalImageUrls = []
      if (formData.additional_images && formData.additional_images.length > 0) {
        for (const image of formData.additional_images) {
          const url = await uploadImage(image.file, 'additional')
          if (url) additionalImageUrls.push(url)
        }
      }

      // Normalize form data to match updated jersey_submissions table schema
      const submissionData = {
        // User info
        submitted_by: user.id,
        status: 'pending',

        // Kit type and basic info
        kit_type: kitType, // 'club' or 'international'
        jersey_type: formData.kit_type, // 'home', 'away', etc.
        season: formData.season,

        // Team/Country (unified field - will contain club name OR country name)
        team_name: kitType === 'club' ? formData.club_name : formData.country_name,

        // League/Competition (unified field)
        league: kitType === 'club'
          ? (formData.league === 'Other' ? formData.league_other : formData.league)
          : formData.tournament,
        competition_gender: formData.competition_gender || 'mens',

        // Player info
        player_name: formData.player_name || null,
        jersey_number: formData.player_number || null,

        // Kit details
        brand: formData.manufacturer,
        primary_color: formData.primary_color || null,
        secondary_color: formData.secondary_color || null,
        main_sponsor: formData.main_sponsor || null,
        additional_sponsors: formData.additional_sponsors || null,
        description: formData.description || null,

        // Separate image fields to match public_jerseys structure
        front_image_url: frontImageUrl,
        back_image_url: backImageUrl,
        additional_image_urls: additionalImageUrls.length > 0 ? additionalImageUrls : null,

        // Tags - could include kit type and other metadata
        tags: [kitType, formData.kit_type].filter(Boolean),

        // Metadata
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Submit to jersey_submissions table
      const { data, error } = await supabase
        .from('jersey_submissions')
        .insert(submissionData)
        .select()
        .single()

      if (error) throw error

      console.log('Kit submitted successfully:', data)
      alert('Kit submitted successfully! It will be reviewed by our team and you\'ll be notified once it\'s approved.')

      // Call success callback to close wizard or navigate
      if (onSubmitSuccess) {
        onSubmitSuccess(data)
      }

    } catch (error) {
      console.error('Submission error:', error)
      alert(`Error submitting kit: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const uploadImage = async (imageFile, type) => {
    if (!imageFile) return null

    try {
      const fileExt = imageFile.name.split('.').pop()
      const timestamp = new Date().getTime()
      const fileName = `${user.id}_${timestamp}_${type}.${fileExt}`
      const filePath = `kit-submissions/${fileName}`

      const { data, error } = await supabase.storage
        .from('jersey-images')
        .upload(filePath, imageFile)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('jersey-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error(`Error uploading ${type} image:`, error)
      throw new Error(`Failed to upload ${type} image: ${error.message}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Review Your Submission</h1>
          <p className="text-lg opacity-90">
            Please review all information before submitting
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="p-8">
        <div className="space-y-8">
          {/* Basic Information Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kitType === 'club' ? (
                <>
                  <div>
                    <span className="block text-sm font-medium text-gray-600">Club Name</span>
                    <span className="text-gray-900">{formData.club_name || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-gray-600">League</span>
                    <span className="text-gray-900">
                      {formData.league === 'Other' ? formData.league_other : formData.league || 'Not specified'}
                    </span>
                  </div>
                </>
              ) : (
                <div>
                  <span className="block text-sm font-medium text-gray-600">Country/Territory</span>
                  <span className="text-gray-900">{formData.country_name || 'Not specified'}</span>
                </div>
              )}
              <div>
                <span className="block text-sm font-medium text-gray-600">Season</span>
                <span className="text-gray-900">{formData.season || 'Not specified'}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-600">Kit Type</span>
                <span className="text-gray-900 capitalize">{formData.kit_type || 'Not specified'}</span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-600">Competition</span>
                <span className="text-gray-900">{formData.competition_gender === 'womens' ? "Women's" : "Men's"}</span>
              </div>
              {formData.player_name && (
                <div>
                  <span className="block text-sm font-medium text-gray-600">Player Name</span>
                  <span className="text-gray-900">{formData.player_name}</span>
                </div>
              )}
              {formData.player_number && (
                <div>
                  <span className="block text-sm font-medium text-gray-600">Player Number</span>
                  <span className="text-gray-900">#{formData.player_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Kit Details Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Kit Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-medium text-gray-600">Manufacturer</span>
                <span className="text-gray-900">{formData.manufacturer || 'Not specified'}</span>
              </div>
              {formData.primary_color && (
                <div>
                  <span className="block text-sm font-medium text-gray-600">Primary Color</span>
                  <span className="text-gray-900">{formData.primary_color}</span>
                </div>
              )}
              {formData.secondary_color && (
                <div>
                  <span className="block text-sm font-medium text-gray-600">Secondary Color</span>
                  <span className="text-gray-900">{formData.secondary_color}</span>
                </div>
              )}
              {formData.main_sponsor && (
                <div>
                  <span className="block text-sm font-medium text-gray-600">Main Sponsor</span>
                  <span className="text-gray-900">{formData.main_sponsor}</span>
                </div>
              )}
              {formData.additional_sponsors && (
                <div>
                  <span className="block text-sm font-medium text-gray-600">Additional Sponsors</span>
                  <span className="text-gray-900">{formData.additional_sponsors}</span>
                </div>
              )}
              {kitType === 'international' && formData.tournament && (
                <div>
                  <span className="block text-sm font-medium text-gray-600">Competition/Tournament</span>
                  <span className="text-gray-900">{formData.tournament}</span>
                </div>
              )}
            </div>
            {formData.description && (
              <div className="mt-4">
                <span className="block text-sm font-medium text-gray-600 mb-2">Description</span>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{formData.description}</p>
              </div>
            )}
          </div>

          {/* Images Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Kit Images
            </h3>

            {/* Main Images */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-800 mb-3">Main Images</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Front Image */}
                <div>
                  <span className="block text-sm font-medium text-gray-600 mb-2">Front Image</span>
                  {formData.front_image ? (
                    <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-center" style={{minHeight: '200px'}}>
                      <img
                        src={URL.createObjectURL(formData.front_image)}
                        alt="Front preview"
                        className="max-w-full max-h-48 object-contain rounded-lg"
                        style={{maxWidth: '180px', maxHeight: '180px'}}
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500" style={{minHeight: '200px'}}>
                      No front image uploaded
                    </div>
                  )}
                </div>

                {/* Back Image */}
                <div>
                  <span className="block text-sm font-medium text-gray-600 mb-2">Back Image</span>
                  {formData.back_image ? (
                    <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-center" style={{minHeight: '200px'}}>
                      <img
                        src={URL.createObjectURL(formData.back_image)}
                        alt="Back preview"
                        className="max-w-full max-h-48 object-contain rounded-lg"
                        style={{maxWidth: '180px', maxHeight: '180px'}}
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500" style={{minHeight: '200px'}}>
                      No back image uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Images */}
            {formData.additional_images && formData.additional_images.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-3">
                  Additional Detail Photos ({formData.additional_images.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formData.additional_images.map((image, index) => (
                    <div key={image.id || index} className="border-2 border-gray-200 rounded-lg bg-gray-50 p-4 flex items-center justify-center" style={{minHeight: '200px'}}>
                      <img
                        src={image.preview}
                        alt={`Additional detail ${index + 1}`}
                        className="max-w-full max-h-48 object-contain rounded-lg"
                        style={{maxWidth: '180px', maxHeight: '180px'}}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submission Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-3">Before You Submit</h4>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Please review all information for accuracy</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>Your submission will be reviewed by our team before being published</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>You will be notified once your kit is approved and added to the database</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>If there are any issues, we may contact you for clarification</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              ← Back to Images
            </button>

            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {stepsLength}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Kit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const KitImageUploadForm = ({ formData, handleFormChange, nextStep, prevStep, currentStep, stepsLength, kitType }) => {
  const [frontImagePreview, setFrontImagePreview] = useState(null)
  const [backImagePreview, setBackImagePreview] = useState(null)
  const [additionalImages, setAdditionalImages] = useState(formData.additional_images || [])

  const handleImageUpload = (e, imageType) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (imageType === 'front') {
          setFrontImagePreview(event.target.result)
          handleFormChange({ target: { name: 'front_image', value: file } })
        } else if (imageType === 'back') {
          setBackImagePreview(event.target.result)
          handleFormChange({ target: { name: 'back_image', value: file } })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const newImage = {
          file,
          preview: event.target.result,
          id: Date.now() + Math.random()
        }
        setAdditionalImages(prev => {
          const updated = [...prev, newImage]
          handleFormChange({ target: { name: 'additional_images', value: updated } })
          return updated
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const removeAdditionalImage = (imageId) => {
    setAdditionalImages(prev => {
      const updated = prev.filter(img => img.id !== imageId)
      handleFormChange({ target: { name: 'additional_images', value: updated } })
      return updated
    })
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Kit Images</h1>
          <p className="text-lg opacity-90">
            Upload photos of your {kitType} kit
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="p-8">
        <div className="space-y-8">
          {/* Required Images Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Required Images</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Front Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Front Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors" style={{minHeight: '200px'}}>
                  {frontImagePreview ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={frontImagePreview}
                        alt="Front preview"
                        className="max-w-full max-h-40 object-contain rounded-lg"
                        style={{maxWidth: '160px', maxHeight: '160px'}}
                      />
                      <button
                        onClick={() => {
                          setFrontImagePreview(null)
                          handleFormChange({ target: { name: 'front_image', value: null } })
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div>
                      <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">Upload front image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'front')}
                        className="hidden"
                        id="front-image-upload"
                      />
                      <label
                        htmlFor="front-image-upload"
                        className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Back Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Back Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors" style={{minHeight: '200px'}}>
                  {backImagePreview ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={backImagePreview}
                        alt="Back preview"
                        className="max-w-full max-h-40 object-contain rounded-lg"
                        style={{maxWidth: '160px', maxHeight: '160px'}}
                      />
                      <button
                        onClick={() => {
                          setBackImagePreview(null)
                          handleFormChange({ target: { name: 'back_image', value: null } })
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div>
                      <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">Upload back image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'back')}
                        className="hidden"
                        id="back-image-upload"
                      />
                      <label
                        htmlFor="back-image-upload"
                        className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Images Section */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Additional Kit Details (Optional)</h3>
            <p className="text-gray-600 mb-6">
              Upload zoomed-in photos of key jersey details like badges, sponsors, manufacturer logos, special features, etc.
            </p>

            {/* Additional Images Grid */}
            {additionalImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {additionalImages.map((image) => (
                  <div key={image.id} className="relative">
                    <div className="w-full h-32 bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden flex items-center justify-center">
                      <img
                        src={image.preview}
                        alt="Additional detail"
                        className="max-w-full max-h-full object-contain"
                        style={{maxWidth: '120px', maxHeight: '120px'}}
                      />
                    </div>
                    <button
                      onClick={() => removeAdditionalImage(image.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add More Images */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              {additionalImages.length === 0 && (
                <PhotoIcon className="h-8 w-8 mx-auto text-gray-400 mb-4" />
              )}
              <p className="text-gray-600 mb-4">
                {additionalImages.length === 0 ? 'Add detail photos' : 'Add more detail photos'}
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImageUpload}
                className="hidden"
                id="additional-images-upload"
              />
              <label
                htmlFor="additional-images-upload"
                className="cursor-pointer bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {additionalImages.length === 0 ? 'Add Images' : 'Add More'}
              </label>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              ← Back
            </button>

            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {stepsLength}
            </div>

            <button
              onClick={nextStep}
              disabled={!frontImagePreview || !backImagePreview}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function KitSubmissionWizard({ onCancel }) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [kitType, setKitType] = useState(null) // 'club' or 'international'

  const handleSubmitSuccess = (submissionData) => {
    console.log('Submission successful:', submissionData)
    // Navigate back to jerseys page or close wizard
    if (onCancel) {
      onCancel()
    } else {
      navigate('/jerseys')
    }
  }
  const [formData, setFormData] = useState({
    // Basic Info - Club
    club_name: '',
    season: '',
    kit_type: 'home', // home, away, third, special
    league: '',
    league_other: '',
    competition_gender: 'mens',
    // Basic Info - International
    country_name: '',
    competition: '',
    competition_other: '',
    // Details (will be used later)
    tournament: '',
    manufacturer: '',
    player_name: '',
    player_number: '',
    main_sponsor: '',
    additional_sponsors: '',
    primary_color: '',
    secondary_color: '',
    description: '',
    // Image fields
    front_image: null,
    back_image: null,
    additional_images: []
  })

  const steps = [
    'Welcome',
    'Kit Type',
    'Basic Info',
    'Details',
    'Images',
    'Review'
  ]

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep, steps.length])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prevData => {
      const updated = { ...prevData, [name]: value }
      // Reset league when competition_gender changes (leagues differ by gender)
      if (name === 'competition_gender' && prevData.league && prevData.league !== 'Other') {
        updated.league = ''
        updated.league_other = ''
      }
      // Auto-suggest women's competition when league_other or tournament contains women-related keywords
      if (name === 'league_other' || name === 'tournament') {
        const checkValue = (value || '').toLowerCase()
        if (/nwsl|wsl|women|w-league|liga\s*f|féminine|frauen|she\s*believes/i.test(checkValue)) {
          updated.competition_gender = 'womens'
        }
      }
      return updated
    })
  }, [])

  // Welcome Screen Component
  const WelcomeScreen = () => (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-8 rounded-t-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Submit New Kits</h1>
          <p className="text-xl opacity-90">
            Help grow the RecollectKits database by adding kits to our collection.
          </p>
        </div>
      </div>

      {/* Two-card selection */}
      <div className="bg-white rounded-b-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
          How would you like to add kits?
        </h2>
        <p className="text-gray-500 text-center mb-8">Choose the method that works best for you</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          {/* Card 1 - Single Kit */}
          <div
            className="rounded-xl cursor-pointer"
            onClick={nextStep}
            style={{
              border: '2px solid #E5E7EB',
              padding: '32px 24px',
              textAlign: 'center',
              transition: 'all 0.2s ease-out',
              background: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#16a34a'
              e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(22, 163, 74, 0.15)'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div
              className="mx-auto mb-5 flex items-center justify-center rounded-full"
              style={{ width: '64px', height: '64px', backgroundColor: 'rgba(22, 163, 74, 0.1)' }}
            >
              <ClipboardDocumentListIcon style={{ width: '32px', height: '32px', color: '#16a34a' }} />
            </div>
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#1F2937',
                marginBottom: '8px'
              }}
            >
              Add Single Kit
            </h3>
            <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.6, marginBottom: '24px' }}>
              Step-by-step wizard for adding one jersey
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); nextStep() }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: '#16a34a', fontSize: '15px', transition: 'background-color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
              Start
              <ArrowRightIcon style={{ width: '18px', height: '18px' }} />
            </button>
          </div>

          {/* Card 2 - Bulk Upload */}
          <div
            className="rounded-xl cursor-pointer"
            onClick={() => navigate('/collection/bulk-upload')}
            style={{
              border: '2px solid #E5E7EB',
              padding: '32px 24px',
              textAlign: 'center',
              transition: 'all 0.2s ease-out',
              background: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7C3AED'
              e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(124, 58, 237, 0.15)'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div
              className="mx-auto mb-5 flex items-center justify-center rounded-full"
              style={{ width: '64px', height: '64px', backgroundColor: 'rgba(124, 58, 237, 0.1)' }}
            >
              <TableCellsIcon style={{ width: '32px', height: '32px', color: '#7C3AED' }} />
            </div>
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#1F2937',
                marginBottom: '8px'
              }}
            >
              Bulk Upload
            </h3>
            <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.6, marginBottom: '24px' }}>
              Add multiple kits at once using a spreadsheet
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); navigate('/collection/bulk-upload') }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: '#7C3AED', fontSize: '15px', transition: 'background-color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6D28D9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
            >
              Start
              <ArrowRightIcon style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>

        {/* Mobile stack override */}
        <style>{`
          @media (max-width: 639px) {
            .max-w-3xl [style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Need help? Contact support</span>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Kit Type Selection Component
  const KitTypeSelection = () => (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Choose Kit Type</h1>
          <p className="text-lg opacity-90">
            What type of kit are you submitting?
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Club Kit Tile */}
          <button
            onClick={() => {
              setKitType('club')
              nextStep()
            }}
            className="group bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-lg p-8 text-center transition-all duration-200 hover:shadow-lg"
          >
            <BuildingOfficeIcon className="h-16 w-16 mx-auto mb-4" style={{color: '#6b46c1'}} />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Club Kit</h3>
            <p className="text-gray-600 leading-relaxed">
              Football club jerseys from teams around the world. Includes domestic leagues,
              cup competitions, and continental tournaments.
            </p>
            <div className="mt-4 text-sm text-blue-600 font-medium">
              Examples: Manchester United, Barcelona, Juventus →
            </div>
          </button>

          {/* International Kit Tile */}
          <button
            onClick={() => {
              setKitType('international')
              nextStep()
            }}
            className="group bg-gray-50 hover:bg-green-50 border-2 border-gray-200 hover:border-green-300 rounded-lg p-8 text-center transition-all duration-200 hover:shadow-lg"
          >
            <GlobeAltIcon className="h-16 w-16 mx-auto mb-4 text-green-600 group-hover:text-green-700" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">International Kit</h3>
            <p className="text-gray-600 leading-relaxed">
              National team jerseys from international competitions. Includes World Cup,
              continental championships, and friendlies.
            </p>
            <div className="mt-4 text-sm text-green-600 font-medium">
              Examples: England, Brazil, Germany →
            </div>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Back
            </button>
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Old inline components removed - now using external components

  // Placeholder for other steps
  const OtherSteps = () => (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Step {currentStep + 1}: {steps[currentStep]}
      </h2>
      <p className="text-gray-600 mb-8">
        Selected Kit Type: {kitType || 'None'}
      </p>
      <p className="text-gray-600 mb-8">
        This step will be implemented next. For now, you can navigate between steps.
      </p>

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={nextStep}
          disabled={currentStep === steps.length - 1}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )

  // Working progress bar with inline styles
  const ProgressIndicator = () => {
    const progressPercentage = (currentStep / (steps.length - 1)) * 100

    return (
      <div style={{
        maxWidth: '800px',
        margin: '0 auto 32px auto',
        padding: '0 32px'
      }}>
        <div style={{ position: 'relative', minHeight: '80px' }}>
          {/* Background line */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            height: '2px',
            backgroundColor: '#d1d5db'
          }}></div>

          {/* Progress line */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            height: '2px',
            width: `${progressPercentage}%`,
            backgroundColor: '#8b5cf6',
            transition: 'width 0.5s ease'
          }}></div>

          {/* Step circles */}
          <div style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            {steps.map((step, index) => (
              <div key={index} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '100px'
              }}>
                {/* Circle */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backgroundColor: index <= currentStep ? '#8b5cf6' : '#d1d5db',
                  color: index <= currentStep ? 'white' : '#6b7280',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  position: 'relative'
                }}>
                  {index < currentStep ? '✓' : index + 1}
                </div>

                {/* Label */}
                <span style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  textAlign: 'center',
                  color: index <= currentStep ? '#111827' : '#6b7280'
                }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ProgressIndicator />

      {currentStep === 0 && <WelcomeScreen />}
      {currentStep === 1 && <KitTypeSelection />}
      {currentStep === 2 && kitType === 'club' && (
        <ClubKitBasicInfoForm
          formData={formData}
          handleFormChange={handleFormChange}
          nextStep={nextStep}
          prevStep={prevStep}
          currentStep={currentStep}
          stepsLength={steps.length}
        />
      )}
      {currentStep === 2 && kitType === 'international' && (
        <InternationalKitBasicInfoForm
          formData={formData}
          handleFormChange={handleFormChange}
          nextStep={nextStep}
          prevStep={prevStep}
          currentStep={currentStep}
          stepsLength={steps.length}
        />
      )}
      {currentStep === 3 && kitType === 'club' && (
        <ClubKitDetailsForm
          formData={formData}
          handleFormChange={handleFormChange}
          nextStep={nextStep}
          prevStep={prevStep}
          currentStep={currentStep}
          stepsLength={steps.length}
        />
      )}
      {currentStep === 3 && kitType === 'international' && (
        <InternationalKitDetailsForm
          formData={formData}
          handleFormChange={handleFormChange}
          nextStep={nextStep}
          prevStep={prevStep}
          currentStep={currentStep}
          stepsLength={steps.length}
        />
      )}
      {currentStep === 4 && (
        <KitImageUploadForm
          formData={formData}
          handleFormChange={handleFormChange}
          nextStep={nextStep}
          prevStep={prevStep}
          currentStep={currentStep}
          stepsLength={steps.length}
          kitType={kitType}
        />
      )}
      {currentStep === 5 && (
        <KitReviewForm
          formData={formData}
          handleFormChange={handleFormChange}
          nextStep={nextStep}
          prevStep={prevStep}
          currentStep={currentStep}
          stepsLength={steps.length}
          kitType={kitType}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
      {currentStep > 5 && <OtherSteps />}
    </div>
  )
}