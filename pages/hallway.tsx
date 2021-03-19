import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import withAuth from '../src/hocs/withAuth'
import SEO from '../src/components/seo'
import Theme from '../src/components/Theme'
import EntiresLayout from '../src/components/EntriesLayout'
import Input from '../src/components/Input'
import generateClassroomNumber from '../src/libs/generateClassroomNumber'
import useIdentity from '../src/hooks/useIdentity'
import useCurrentUser from '../src/hooks/metabase/useCurrentUser'
import useMetabaseApiHost from '../src/hooks/useMetabaseApiHost'
import useCreateClassroom from '../src/hooks/useCreateClassroom'
import useJoinClassroom from '../src/hooks/useJoinClassroom'

const Hallway = () => {
  const { apiHost } = useMetabaseApiHost()
  const { username, sessionId } = useIdentity()
  const { data: currentUser, error: currentUserError } = useCurrentUser(!!(apiHost && sessionId))
  const router = useRouter()
  const classroomNumRef = useRef<HTMLInputElement>(null)
  const [newClassroomNum, setNewClassroomNum] = useState(generateClassroomNumber())
  const { create, error: createError, randomKey: createdRandomKey } = useCreateClassroom()
  const { join, error: joinError, randomKey: joinedRandomKey } = useJoinClassroom()

  const _joinClassroom = (evt: React.FormEvent) => {
    evt.preventDefault()
    join(classroomNumRef?.current?.value as string)
  }

  const _createClassroom = (evt: React.FormEvent) => {
    evt.preventDefault()
    create(newClassroomNum)
  }

  const _onNewClassRoomNumChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setNewClassroomNum(evt.target.value)
  }

  /* identity check
   *
   * if api host and session id are provided:
   *   validate session id
   *   if valid
   *     stay
   * redirect to homepage
   */
  useEffect(() => {
    if (!apiHost || !currentUser || currentUserError) {
      router.push('/')
    }
  }, [apiHost, currentUser, currentUserError])

  useEffect(() => {
    if (createdRandomKey) {
      router.push(`/c/${createdRandomKey}/${username}`)
    }
  }, [createdRandomKey])

  useEffect(() => {
    if (joinedRandomKey) {
      router.push(`/c/${joinedRandomKey}/${username}`)
    }
  }, [joinedRandomKey])

  return (
    <>
      <SEO title='Hallway' />
      <Theme>
        <EntiresLayout title='Hallway'>
          <form onSubmit={_joinClassroom}>
            <StyledLabel>
              <span>Join a classroom</span>
              <br />
              <Input
                ref={classroomNumRef}
                autoFocus
                type='text'
                placeholder='classroom number'
                required
              />
            </StyledLabel>
            <StyledError>
              {joinError?.message}&nbsp;
            </StyledError>
          </form>
          <StyledDivider>or</StyledDivider>
          <form onSubmit={_createClassroom}>
            <StyledLabel>
              <span>Create a classroom</span>
              <br />
              <Input
                type='text'
                value={newClassroomNum}
                onChange={_onNewClassRoomNumChange}
                placeholder='classroom number'
                required
              />
            </StyledLabel>
            <StyledError>
              {createError?.message}&nbsp;
            </StyledError>
          </form>
        </EntiresLayout>
      </Theme>
    </>
  )
}

const StyledLabel = styled.label`
  display: block;
  span {
    ${({ theme }) => theme.smallText}
  }
`
const StyledDivider = styled.div`
  margin-top: 2rem;
  margin-bottom: 2rem;
`
const StyledError = styled.span`
  color: ${({ theme }) => theme.colors.error};
`

export default withAuth(Hallway)
