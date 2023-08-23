import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])

  const [searchInput, setSearchInput] = useState('')

  const [organization, setOrganization] = useState([])
  const [selectedOrgId, setSelectedOrgId] = useState('')

  const [research, setResearch] = useState([])
  const [selectedResearchId, setSelectedResearchId] = useState('')

  const [partner, setPartner] = useState([])
  const [selectedPartnerId, setSelectedPartnerId] = useState('')

  /* Fetch Research Interest */
  useEffect(() => {
    const fetchResearchData = async () => {
      const response = await fetch(
        // 'https://acf/wp-json/wp/v2/research_interest'
        'https://acf.ornl.gov/wp-json/wp/v2/research_interest'
      )
      const data = await response.json()
      setResearch(data)
    }

    fetchResearchData()
  }, [])

  /* Fetch Organizations */
  useEffect(() => {
    const fetchOrganizationData = async () => {
      const response = await fetch(
        // 'https://acf/wp-json/wp/v2/organization_type'
        'https://acf.ornl.gov/wp-json/wp/v2/organization_type'
      )
      const data = await response.json()
      setOrganization(data)
    }

    fetchOrganizationData()
  }, [])

  /* Fetch Partners */
  useEffect(() => {
    const fetchPartnerData = async () => {
      const response = await fetch(
        // 'https://acf/wp-json/wp/v2/partner_interest'
        'https://acf.ornl.gov/wp-json/wp/v2/partner_interest'
      )
      const data = await response.json()
      setPartner(data)
    }

    fetchPartnerData()
  }, [])

  /* fetch profiles */
  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch(
        // 'https://acf/wp-json/wp/v2/profiles'
        'https://acf.ornl.gov/wp-json/wp/v2/profiles'
      )
      const data = await response.json()
      setUsers(data)
    }

    fetchUserData()
  }, [])

  /* fetch profiles */
  useEffect(() => {
    let newFilteredUsers = users
    console.log(users)
    if(searchInput){
      newFilteredUsers =  newFilteredUsers.filter(user=>(user.acf.first_name.toLowerCase() + ' ' + user.acf.last_name.toLowerCase()).includes(searchInput.toLowerCase()))

    }
    if(selectedOrgId){
      newFilteredUsers =  newFilteredUsers.filter(user=>user.organization_type.includes(selectedOrgId))
    }
    if(selectedPartnerId){
      newFilteredUsers =  newFilteredUsers.filter(user=>user.partner_interest.includes(selectedPartnerId))
    }
    if(selectedResearchId){
      console.log(selectedResearchId)
      newFilteredUsers =  newFilteredUsers.filter(user=>user.research_interest.includes(selectedResearchId))
    }
    setFilteredUsers(newFilteredUsers)
   
  }, [searchInput, selectedOrgId,selectedResearchId, selectedPartnerId, users ])

  const handleSelectResearchChange = (e) => {
    const value = e.target.value
    setSelectedResearchId(value ? +value : null)
  }

  const handleSelectOrganizationChange = (e) => {
    const value = e.target.value
    setSelectedOrgId(value ? +value : null)
  }

  const handleSelectPartnerChange = (e) => {
    const value = e.target.value
    setSelectedPartnerId(value ? +value : null)
  }

  /* handle search filter */
  const filter = (e) => {
    const keyword = e.target.value

    if (keyword !== '') {
      const res = users.filter((user) => {
        return (
          user.acf.first_name.toLowerCase().includes(keyword.toLowerCase()) ||
          user.acf.last_name.toLowerCase().includes(keyword.toLowerCase())
        )
      })
      setFilteredUsers(res)
    } else {
      setFilteredUsers(users)
    }

    setSearchInput(keyword)
  }

  const clearFilters = () => {
    setSelectedResearchId('')
    setSelectedOrgId('')
    setSelectedPartnerId('')
    setSearchInput('')
    setFilteredUsers(users)
  }


  return (
    <>
      {/* Searchbar */}
      <div style={{ display: 'flex', marginLeft: '10px' }}>
        <input
          type='search'
          value={searchInput}
          onChange={filter}
          placeholder='Search Contacts'
        />

        {/* Filter Organization Dropdown */}
        <div style={{ marginLeft: '20px' }}>
          <select onChange={handleSelectOrganizationChange} value={selectedOrgId} id='filter'>
            <option value=''>Select organization</option>
            {organization.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Research Dropdown */}
        <div style={{ marginLeft: '20px' }}>
          <select onChange={handleSelectResearchChange} value={selectedResearchId} id='filter'>
            <option value=''>Select research interest</option>
            {research.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Partner Dropdown */}
        <div style={{ marginLeft: '20px' }}>
          <select onChange={handleSelectPartnerChange} value={selectedPartnerId} id='filter'>
            <option value=''>Select partner interest</option>
            {partner.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: '20px' }}>
          <button onClick={clearFilters}>Clear Filters</button>
        </div>
      </div>

      {/* Searched User Profiles */}
      <div style={{ display: 'flex', flexWrap: 'wrap', padding: 20 }}>
        {
            
            filteredUsers.map((user) => (
            <div key={user.id} style={{ margin: 20, border: '2px solid #e8e8e8', paddingLeft: 20, paddingRight: 20, paddingTop: 10, borderRadius: 5 }}>
              {user.acf.first_name}
              <span> {user.acf.last_name}</span>
              <br />
              <p>
                {user.acf.organization}
              </p>
              <p>{user.acf.state}</p>
            </div>
          ))}
      </div>

    </>
  )
}

export default App