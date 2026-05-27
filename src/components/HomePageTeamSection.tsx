'use client'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'

interface TeamMember {
    id: number
    name: string
    role: string
    image: string
    image_url: string
    social_platform: string
    social_url: string
    order: number
    is_active: boolean
}

const socialIconMap: Record<string, string> = {
    linkedin: 'bxl-linkedin',
    facebook: 'bx bxl-facebook',
    twitter: 'bxl-twitter',
    instagram: 'bxl-instagram',
    youtube: 'bxl-youtube',
    github: 'bxl-github',
}

const socialLabelMap: Record<string, string> = {
    linkedin: 'LinkedIn',
    facebook: 'Facebook',
    twitter: 'Twitter',
    instagram: 'Instagram',
    youtube: 'YouTube',
    github: 'GitHub',
}

const HomePageTeamSection: React.FC = () => {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_REACT_APP_API_URL || 'https://api.kavalakat.com/api'}/team/`
                )
                if (!response.ok) return
                const data = await response.json()
                const members: TeamMember[] = (
                    Array.isArray(data) ? data : (data.data ?? data.results ?? [])
                )
                    .filter((m: TeamMember) => m.is_active)
                    .sort((a: TeamMember, b: TeamMember) => a.order - b.order)
                setTeamMembers(members)
            } catch {
                // silently fail — section stays hidden
            }
        }

        fetchTeam()
    }, [])

    if (teamMembers.length === 0) return null

    const wowDelays = ['200ms', '400ms', '600ms', '800ms', '1000ms']

    return (
        <>
            <div className="home1-team-section mb-120">
                <div className="container">
                    <div className="row justify-content-center mb-70 wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
                        <div className="col-xl-4 col-lg-5 col-md-8">
                            <div className="section-title text-center">
                                <h2>Meet Our Team</h2>
                            </div>
                        </div>
                    </div>
                    <ul className="team-list">
                        {teamMembers.map((member, index) => {
                            const platform = member.social_platform?.toLowerCase() || ''
                            const icon = socialIconMap[platform] || 'bxl-globe'
                            const label = socialLabelMap[platform] || member.social_platform || 'Social'
                            const delay = wowDelays[index % wowDelays.length]

                            return (
                                <li
                                    key={member.id}
                                    className="single-item wow animate fadeInDown"
                                    data-wow-delay={delay}
                                    data-wow-duration="1500ms"
                                >
                                    <div className="team-name-and-desig">
                                        <span>{member.role}</span>
                                        <h4>{member.name}</h4>
                                    </div>
                                    <div className="team-img">
                                        <img
                                            width={100}
                                            height={100}
                                            src={member.image_url || member.image}
                                            alt={member.name}
                                        />
                                    </div>
                                    <a href={member.social_url} className="social-area" target="_blank" rel="noopener noreferrer">
                                        <div className="icon">
                                            <span><i className={`bx ${icon}`} /></span>
                                        </div>
                                        <span>{label}</span>
                                    </a>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </>
    )
}

export default HomePageTeamSection