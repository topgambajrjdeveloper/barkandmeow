// Interfaces para mascotas
export interface Pet {
  id: string
  name: string
  type: string
  breed: string | null
  age: number | null
  image: string | null
  description: string | null
  createdAt: string
  userId: string
  user: {
    id: string
    username: string
    email: string
    profileImage: string | null
  }
  _count: {
    followers: number
  }
  status?: "active" | "hidden" | "reported"
  passport?: {
    passportNumber: string
    issuedDate: string
    expiryDate?: string | null
    issuingCountry: string
    microchipNumber?: string | null
    species: string
    breed: string
    sex: string
    dateOfBirth: string
    transponderCode?: string | null
    transponderReadDate?: string | null
    transponderLocation?: string | null
    tattooCode?: string | null
    tattooDate?: string | null
    tattooLocation?: string | null
    veterinarianName: string
    clinicAddress: string
    clinicPostalCode: string
    clinicCity: string
    clinicCountry: string
    clinicPhone: string
    clinicEmail: string
  } | null
  healthCard?: {
    id: string
    vaccinations: {
      id: string
      name: string
      date: string
      nextDueDate?: string | null
      veterinarian?: string | null
    }[]
    medications: {
      id: string
      name: string
      dosage: string
      frequency: string
      startDate: string
      endDate?: string | null
    }[]
    medicalHistory: {
      id: string
      date: string
      description: string
      veterinarian?: string | null
    }[]
  } | null
}

export interface PetPassport {
  id: string
  passportNumber: string
  issuedDate: string
  expiryDate: string | null
  issuingCountry: string
  microchipNumber: string | null
  species: string
  breed: string
  sex: string
  dateOfBirth: string
  transponderCode?: string | null
  transponderReadDate?: string | null
  transponderLocation?: string | null
  tattooCode?: string | null
  tattooDate?: string | null
  tattooLocation?: string | null
  veterinarianName: string
  clinicAddress: string
  clinicPostalCode: string
  clinicCity: string
  clinicCountry: string
  clinicPhone: string
  clinicEmail: string
}

export interface HealthCard {
  id: string
  vaccinations: Vaccination[]
  medications: Medication[]
  medicalHistory: MedicalRecord[]
}

export interface Vaccination {
  id: string
  name: string
  date: string
  nextDueDate?: string | null
  veterinarian?: string | null
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string | null
}

export interface MedicalRecord {
  id: string
  date: string
  description: string
  veterinarian?: string | null
}

// Interfaces para usuarios y relaciones sociales
export interface Friend {
  id: string
  username: string
  profileImage: string | null
}

export interface Follower {
  id: string
  username: string
  profileImage: string | null
}

export interface UserProfile {
  id: string
  username: string
  email: string
  profileImage: string | null
  bio?:string | null
  petName: string
  petType: string
  petImage: string | null
  isPublicProfile: boolean
  location: string | null
  createdAt: string
  postsCount: number
  followersCount: number
  followingCount: number
  pets: Pet[]
  friends: Friend[]
  isFollowing: boolean
  isFollowedBy?: boolean
  followers: Follower[]
  following: Follower[]
}

// Interfaces para componentes específicos
export interface PostCardProps {
  content: string
  image: string
  likes: number
  comments: number
  timeAgo: string
}

export interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: {
    id: string
    username: string
    profileImage: string | null
    bio?: string
    location: string | null
    isPublicProfile: boolean
  }
}

