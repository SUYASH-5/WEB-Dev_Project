import React from 'react'
import TeacherClasses from '../components/TeacherClass'
import { useAuth } from '../context/UseAuth'
import UserClass from '../components/UserClass'

const Classes = () => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Not logged in</p>;

  return (
    <div>
      {user.role === "teacher" ? (
        <TeacherClasses />
      ) : (
        <UserClass />
      )}
    </div>
  )
}

export default Classes