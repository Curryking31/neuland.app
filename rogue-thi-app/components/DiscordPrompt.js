import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

import API from '../lib/thi-backend/authenticated-api'
import { NoSessionError } from '../lib/thi-backend/thi-session-handler'

import courseShorts from '../data/course-short-names.json'

import styles from '../styles/Home.module.css'

const discordUrls = JSON.parse(process.env.NEXT_PUBLIC_DISCORD_URLS || '{}')

export default function DiscordPrompt () {
  const router = useRouter()
  const [faculty, setFaculty] = useState(null)
  const [discordUrl, setDiscordUrl] = useState(null)

  useEffect(() => {
    async function load () {
      try {
        const response = await API.getPersonalData()
        const course = response.persdata.stg
        const faculty = Object.keys(courseShorts).find(faculty => courseShorts[faculty].hasOwnProperty(course))
        if (discordUrls.hasOwnProperty(faculty)) {
          setFaculty(faculty)
          setDiscordUrl(discordUrls[faculty])
        }
      } catch (e) {
        if (e instanceof NoSessionError) {
          router.replace('/login')
        } else {
          console.error(e)
          alert(e)
        }
      }
    }

    if (!localStorage.closedDiscordPrompt) {
      load()
    }
  }, [router])

  function close () {
    setFaculty(null)
    setDiscordUrl(null)
    localStorage.closedDiscordPrompt = true
  }

  return faculty && discordUrl && (
    <Card className={styles.card}>
      <Card.Body>
        <Card.Title>
          <FontAwesomeIcon icon={faDiscord} fixedWidth />
          {' '}
          Fakultäts Discord
          <Button variant="link" className={styles.cardButton} onClick={() => close()}>
            <FontAwesomeIcon icon={faTimes} />
          </Button>
        </Card.Title>
        <Card.Text>
          <p>
            Von der Studierendenvertretung deiner Fakultät {faculty} gibt es einen offiziellen Discord Server.
            Du kannst ihm hier beitreten: <a href={discordUrl} target="_blank" rel="noreferrer">{discordUrl}</a>
          </p>
        </Card.Text>
      </Card.Body>
    </Card>
  )
}
