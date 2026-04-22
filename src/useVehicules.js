import { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore'

export function useVehicules() {
  const [vehicules, setVehicules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'vehicules'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      data.sort((a,b) => a.nom.localeCompare(b.nom))
      setVehicules(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const addVehicule = async (nom, type) => {
    await addDoc(collection(db, 'vehicules'), { nom, type })
  }

  const deleteVehicule = async (id) => {
    await deleteDoc(doc(db, 'vehicules', id))
  }

  return { vehicules, loading, addVehicule, deleteVehicule }
}