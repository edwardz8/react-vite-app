import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [filteredUsers, setFilteredUsers] = useState([])

  const [searchInput, setSearchInput] = useState(
    () => JSON.parse(localStorage.getItem('searchInput')) || ''
  )

  const [organization, setOrganization] = useState([])
  const [selectedOrgId, setSelectedOrgId] = useState(
    () => JSON.parse(localStorage.getItem('selectedOrgId')) || ''
  )

  const [research, setResearch] = useState([])
  const [selectedResearchId, setSelectedResearchId] = useState(
    () => JSON.parse(localStorage.getItem('selectedResearchId')) || ''
  )

  const [partner, setPartner] = useState([])
  const [selectedPartnerId, setSelectedPartnerId] = useState(
    () => JSON.parse(localStorage.getItem('selectedPartnerId')) || ''
  )

  /* Fetch Research Interest */
  useEffect(() => {
    const fetchResearchData = async () => {
      const response = await fetch(
        // 'https://acf/wp-json/wp/v2/research_interest'
        'https://acf.ornl.gov/wp-json/wp/v2/research_interest'
        //'https://ac-forum.flywheelstaging.com/wp-json/wp/v2/research_interest'
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
        // 'https://ac-forum.flywheelstaging.com/wp-json/wp/v2/organization_type'
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
        // 'https://ac-forum.flywheelstaging.com/wp-json/wp/v2/partner_interest'
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
        `https://acf.ornl.gov/wp-json/wp/v2/profiles?per_page=10&page=${page}`
        // 'https://ac-forum.flywheelstaging.com/wp-json/wp/v2/profiles'
      )
      setTotalPages(+response.headers.get('X-WP-TotalPages'))
      const data = await response.json()
      setUsers(data)
    }

    fetchUserData()
  }, [page])

  /* fetch profiles */
  useEffect(() => {
    let newFilteredUsers = users
    if (searchInput) {
      newFilteredUsers = newFilteredUsers.filter((user) => {
        const partner_interests = user.partner_interest
          .map((i) => getPartnerInterest(i))
          .join(' ')
        const str =
          user.acf.first_name +
          ' ' +
          user.acf.last_name +
          ', ' +
          getResearchInterest(user.research_interest[0]) +
          ', ' +
          partner_interests +
          ', ' +
          user.acf.organization
        return str.toLowerCase().includes(searchInput.toLowerCase())
      })
    }
    if (selectedOrgId) {
      newFilteredUsers = newFilteredUsers.filter((user) =>
        user.organization_type.includes(selectedOrgId)
      )
    }
    if (selectedPartnerId) {
      newFilteredUsers = newFilteredUsers.filter((user) =>
        user.partner_interest.includes(selectedPartnerId)
      )
    }
    if (selectedResearchId) {
      newFilteredUsers = newFilteredUsers.filter((user) =>
        user.research_interest.includes(selectedResearchId)
      )
    }
    newFilteredUsers = newFilteredUsers.sort((a, b) => {
      if (a.acf.last_name < b.acf.last_name) return -1
      if (a.acf.last_name > b.acf.last_name) return 1
      return 0
    })
    saveFilters(
      searchInput,
      selectedOrgId,
      selectedPartnerId,
      selectedResearchId
    )
    setFilteredUsers(newFilteredUsers)
  }, [searchInput, selectedOrgId, selectedResearchId, selectedPartnerId, users])

  const saveFilters = (
    searchInput,
    selectedOrgId,
    selectedPartnerId,
    selectedResearchId
  ) => {
    localStorage.setItem('searchInput', JSON.stringify(searchInput))
    localStorage.setItem('selectedOrgId', JSON.stringify(selectedOrgId))
    localStorage.setItem('selectedPartnerId', JSON.stringify(selectedPartnerId))
    localStorage.setItem(  'selectedResearchId',   JSON.stringify(selectedResearchId) )
  }

  const getResearchInterest = (id) => {
    if (!research) return
    const name = research.find((item) => item.id === id)?.name
    return name
  }

  const getPartnerInterest = (id) => {
    if (!partner) return
    const name = partner.find((item) => item.id === id)?.name
    return name
  }

  const getOrganizationType = (id) => {
    if (!organization) return
    const name = organization.find((item) => item.id === id)?.name
    return name
  }

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

  const paginate = (page) => {
    setPage(page)
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
          <select
            onChange={handleSelectOrganizationChange}
            value={selectedOrgId}
            id='filter'
          >
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
          <select
            onChange={handleSelectResearchChange}
            value={selectedResearchId}
            id='filter'
          >
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
          <select
            onChange={handleSelectPartnerChange}
            value={selectedPartnerId}
            id='filter'
          >
            <option value=''>Select partner interest</option>
            {partner.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: '20px' }}>
          <button onClick={clearFilters}>Clear</button>
        </div>
      </div>

      {/* Searched User Profiles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat( auto-fit, minmax(250px, 1fr) )',
        }}
      >
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            style={{
              margin: 20,
              border: '2px solid #e8e8e8',
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 10,
              borderRadius: 5,
            }}
          >
            <a href={user.link}>
              {user.acf.first_name}
              <span> {user.acf.last_name}</span>
            </a>
            <p>{user.acf.state}</p>
            <p>{user.acf.organization}</p>
            <p>
              Organization Type:{' '}
              {getOrganizationType(user.organization_type[0])}
            </p>

            <h4>Interests</h4>
            <p>Research: {getResearchInterest(user.research_interest[0])}</p>
            <p>Partner: {getPartnerInterest(user.partner_interest[0])}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 ? (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          {page > 1 ? (
            <div
              style={{
                height: '24px',
                cursor: 'pointer',
                padding: '0px 3px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                color: '#646cff',
              }}
              onClick={() => paginate(page - 1)}
            >
              Prev
            </div>
          ) : null}
          {page > 1 ? (
            <div
              style={{
                height: '24px',
                cursor: 'pointer',
                width: '24px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                color: '#646cff',
              }}
              onClick={() => paginate(1)}
            >
              1
            </div>
          ) : null}
          {page - 2 > 1 ? <div>...</div> : null}
          {page - 1 > 1 ? (
            <div
              style={{
                height: '24px',
                cursor: 'pointer',
                width: '24px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                color: '#646cff',
              }}
              onClick={() => paginate(page - 1)}
            >
              {page - 1}
            </div>
          ) : null}
          <div
            style={{
              height: '24px',
              width: '24px',
              cursor: 'pointer',
              backgroundColor: '#646cff',
              borderRadius: '4px',
              color: '#fff',
            }}
          >
            {page}
          </div>
          {totalPages > page + 1 ? (
            <div
              style={{
                height: '24px',
                cursor: 'pointer',
                width: '24px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                color: '#646cff',
              }}
              onClick={() => paginate(page + 1)}
            >
              {page + 1}
            </div>
          ) : null}
          {totalPages > page + 2 ? <div>...</div> : null}
          {totalPages !== page ? (
            <div
              style={{
                height: '24px',
                cursor: 'pointer',
                width: '24px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                color: '#646cff',
              }}
              onClick={() => paginate(totalPages)}
            >
              {totalPages}
            </div>
          ) : null}
          {page < totalPages ? (
            <div
              style={{
                height: '24px',
                cursor: 'pointer',
                padding: '0px 3px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                color: '#646cff',
              }}
              onClick={() => paginate(page + 1)}
            >
              Next
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  )
}

export default App
