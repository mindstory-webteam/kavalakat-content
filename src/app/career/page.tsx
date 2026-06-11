'use client'

import FooterTop from '@/components/FooterTop'
import InnerPageHeader from '@/components/InnerPageHeader'
import React, { useState, useEffect } from 'react'
import Footer1 from '@/components/Footer'
import Breadcrumb from '@/components/common/Breadcrumb'

const API_BASE = process.env.NEXT_PUBLIC_REACT_APP_API_URL || 'https://api.kavalakat.com/api'

interface Job {
    id: number
    title: string
    department: string
    location: string
    type: string
    posted: string
    description: string
    requirements?: string
    experience?: string
    salary_range?: string
    apply_url?: string
    is_active?: boolean
    deadline?: string
    is_expired?: boolean
    job_type?: string
    created_at?: string
    updated_at?: string
}

interface FormData {
    fullName: string
    email: string
    phone: string
    coverLetter: string
    resume: File | null
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

const CareerPage = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        phone: '',
        coverLetter: '',
        resume: null
    })
    const [jobListings, setJobListings] = useState<Job[]>([])
    const [loadingJobs, setLoadingJobs] = useState<boolean>(true)
    const [jobsError, setJobsError] = useState<string | null>(null)
    const [submitState, setSubmitState] = useState<SubmitState>('idle')
    const [submitError, setSubmitError] = useState<string | null>(null)

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoadingJobs(true)
                setJobsError(null)
                const response = await fetch(`${API_BASE}/careers/`)
                if (!response.ok) {
                    throw new Error(`Failed to fetch job listings (${response.status})`)
                }
                const data = await response.json()
                // Handle both array and paginated response shapes:
                // { success, pagination, data: [...] }  OR  { results: [...] }  OR  [...]
                const jobs: any[] = Array.isArray(data)
                    ? data
                    : (data.data ?? data.results ?? [])

                const mapped: Job[] = jobs
                    .filter((job: any) => job.is_active && !job.is_expired)
                    .map((job: any) => ({
                        id: job.id,
                        title: job.title,
                        department: job.department,
                        location: job.location,
                        type: job.job_type || job.type,
                        posted: job.created_at
                            ? new Date(job.created_at).toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                              })
                            : '',
                        description: job.description,
                        requirements: job.requirements,
                        experience: job.experience,
                        salary_range: job.salary_range,
                        apply_url: job.apply_url,
                        is_active: job.is_active,
                        deadline: job.deadline,
                        is_expired: job.is_expired,
                        job_type: job.job_type,
                        created_at: job.created_at,
                        updated_at: job.updated_at,
                    }))
                setJobListings(mapped)
            } catch (error: any) {
                setJobsError('Unable to load job listings. Please try again later.')
                console.error('[Careers] fetch error:', error)
            } finally {
                setLoadingJobs(false)
            }
        }

        fetchJobs()
    }, [])

    const handleApplyClick = (job: Job) => {
        setSelectedJob(job)
        setIsModalOpen(true)
        setSubmitState('idle')
        setSubmitError(null)
        if (typeof document !== 'undefined') {
            document.body.style.overflow = 'hidden'
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedJob(null)
        setSubmitState('idle')
        setSubmitError(null)
        if (typeof document !== 'undefined') {
            document.body.style.overflow = 'auto'
        }
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            coverLetter: '',
            resume: null
        })
    }

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type === 'application/pdf') {
            setFormData((prev) => ({ ...prev, resume: file }))
        } else {
            alert('Please upload a PDF file only')
            e.target.value = ''
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedJob) return

        setSubmitState('submitting')
        setSubmitError(null)

        try {
            // Build multipart form — field names match the Django Application serializer
            const payload = new FormData()
            payload.append('name', formData.fullName)
            payload.append('email', formData.email)
            payload.append('phone', formData.phone)
            payload.append('cover_letter', formData.coverLetter)
            payload.append('career', selectedJob.id.toString())
            if (formData.resume) {
                payload.append('resume', formData.resume)
            }

            // POST /api/applications/
            // Do NOT set Content-Type — browser sets it with the correct multipart boundary
            const response = await fetch(`${API_BASE}/applications/`, {
                method: 'POST',
                body: payload,
            })

            const responseData = await response.json().catch(() => null)

            if (!response.ok) {
                // Log full DRF error for debugging
                console.error('[Careers] API error:', JSON.stringify(responseData, null, 2))

                let msg = `Server error (${response.status})`
                if (responseData) {
                    if (typeof responseData === 'string') {
                        msg = responseData
                    } else if (responseData.detail) {
                        msg = responseData.detail
                    } else if (responseData.message) {
                        msg = responseData.message
                    }
                    // Parse nested errors: { errors: { field: ["msg"] } }
                    const errSource = responseData.errors || responseData
                    if (typeof errSource === 'object' && !Array.isArray(errSource)) {
                        const fieldErrors = Object.entries(errSource)
                            .map(([field, errors]) => {
                                const errList = Array.isArray(errors) ? errors.join(', ') : String(errors)
                                return `${field}: ${errList}`
                            })
                            .join(' | ')
                        if (fieldErrors) msg = fieldErrors
                    }
                }
                throw new Error(msg)
            }

            setSubmitState('success')
        } catch (error: any) {
            console.error('[Careers] submit error:', error)
            setSubmitError(
                error.message || 'Failed to submit application. Please try again.'
            )
            setSubmitState('error')
        }
    }

    return (
        <>
            <InnerPageHeader />
            <Breadcrumb
                title="Careers"
                subtitle="Join Our Team & Build Your Future With Us"
                image="/assets/new-images/new-images/career.webp"
            />

            <div className="career-page pt-120 mb-120">
                <div className="container">
                    {/* Career Introduction */}
                    <div className="row mb-70">
                        <div className="col-lg-8 mx-auto text-center">
                            <h2>Why Work With Us?</h2>
                            <p className="mt-4">
                                We&apos;re always looking for talented individuals to join our growing team.
                                We offer competitive salaries, great benefits, and a collaborative work
                                environment where you can grow your career and make an impact.
                            </p>
                        </div>
                    </div>

                    {/* Job Listings */}
                    <div className="row gy-5">
                        {loadingJobs ? (
                            <div className="col-lg-12 text-center py-5">
                                <p>Loading job listings...</p>
                            </div>
                        ) : jobsError ? (
                            <div className="col-lg-12 text-center py-5">
                                <p className="text-danger">{jobsError}</p>
                            </div>
                        ) : jobListings.length === 0 ? (
                            <div className="col-lg-12 text-center py-5">
                                <p>No open positions at this time. Please check back later.</p>
                            </div>
                        ) : (
                            jobListings.map((job) => (
                                <div key={job.id} className="col-lg-12">
                                    <div className="job-card">
                                        <div className="job-header">
                                            <div className="job-info">
                                                <h3>{job.title}</h3>
                                                <ul className="job-meta">
                                                    <li>
                                                        <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M8 0C3.60594 0 0 3.60594 0 8C0 12.3941 3.60594 16 8 16C12.3941 16 16 12.3941 16 8C16 3.60594 12.3941 0 8 0Z" />
                                                        </svg>
                                                        {job.posted}
                                                    </li>
                                                    <li>
                                                        <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M8 0C3.60594 0 0 3.60594 0 8C0 12.3941 3.60594 16 8 16C12.3941 16 16 12.3941 16 8C16 3.60594 12.3941 0 8 0Z" />
                                                        </svg>
                                                        {job.location}
                                                    </li>
                                                    <li>
                                                        <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M8 0C3.60594 0 0 3.60594 0 8C0 12.3941 3.60594 16 8 16C12.3941 16 16 12.3941 16 8C16 3.60594 12.3941 0 8 0Z" />
                                                        </svg>
                                                        {job.type}
                                                    </li>
                                                    <li>
                                                        <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M8 0C3.60594 0 0 3.60594 0 8C0 12.3941 3.60594 16 8 16C12.3941 16 16 12.3941 16 8C16 3.60594 12.3941 0 8 0Z" />
                                                        </svg>
                                                        {job.department}
                                                    </li>
                                                    {job.deadline && (
                                                        <li>
                                                            <svg width={16} height={16} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M8 0C3.60594 0 0 3.60594 0 8C0 12.3941 3.60594 16 8 16C12.3941 16 16 12.3941 16 8C16 3.60594 12.3941 0 8 0Z" />
                                                            </svg>
                                                            Deadline:{' '}
                                                            {new Date(job.deadline).toLocaleDateString('en-GB', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            })}
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                            <button
                                                onClick={() => handleApplyClick(job)}
                                                className="apply-btn primary-btn3 black-bg"
                                                type="button"
                                            >
                                                <span>Apply Now</span>
                                                <span>Apply Now</span>
                                                <svg className="arrow" width={23} height={23} viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                                                    <g>
                                                        <path d="M0.113861 0H22.9999V4.28425L4.32671 22.9997L0 18.7154L12.7524 6.08815L0.113861 6.20089V0Z" />
                                                        <path d="M23 22.9996V8.56848L16.8516 14.6566V22.9996H23Z" />
                                                    </g>
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="job-description">
                                            <p>{job.description}</p>
                                        </div>
                                        {job.requirements && (
                                            <div className="job-requirements">
                                                <h5>Requirements</h5>
                                                <p>{job.requirements}</p>
                                            </div>
                                        )}
                                        {job.salary_range && (
                                            <div className="job-salary">
                                                <span>💰 {job.salary_range}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Application Modal */}
            {isModalOpen && selectedJob && (
                <div className="career-modal-overlay" onClick={closeModal}>
                    <div className="career-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal} type="button">
                            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        <div className="modal-header">
                            <h3>Apply for {selectedJob.title}</h3>
                            <p>{selectedJob.department} • {selectedJob.location}</p>
                        </div>

                        <div className="modal-body">
                            {/* Success State */}
                            {submitState === 'success' ? (
                                <div className="submit-success">
                                    <svg width={60} height={60} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx={30} cy={30} r={30} fill="#e8f5e9" />
                                        <path d="M18 30L26 38L42 22" stroke="#2e7d32" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <h4>Application Submitted!</h4>
                                    <p>Thank you for applying for <strong>{selectedJob.title}</strong>. We&apos;ll review your application and get back to you soon.</p>
                                    <button type="button" className="primary-btn3 black-bg mt-20" onClick={closeModal}>
                                        <span>Close</span>
                                        <span>Close</span>
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="form-inner mb-30">
                                                <label>Full Name *</label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleInputChange}
                                                    placeholder="John Doe"
                                                    required
                                                    disabled={submitState === 'submitting'}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-inner mb-30">
                                                <label>Email *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="john@example.com"
                                                    required
                                                    disabled={submitState === 'submitting'}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-inner mb-30">
                                                <label>Phone *</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="+91 98765 43210"
                                                    required
                                                    disabled={submitState === 'submitting'}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-inner mb-30">
                                                <label>Upload Resume (PDF only) *</label>
                                                <div className="file-upload-wrapper">
                                                    <input
                                                        type="file"
                                                        id="resume"
                                                        accept=".pdf"
                                                        onChange={handleFileChange}
                                                        required
                                                        className="file-input"
                                                        disabled={submitState === 'submitting'}
                                                    />
                                                    <label htmlFor="resume" className="file-upload-label">
                                                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12 2L12 14M12 2L8 6M12 2L16 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M3 14V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                                                        </svg>
                                                        {formData.resume ? formData.resume.name : 'Choose PDF file'}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-inner mb-50">
                                                <label>Cover Letter *</label>
                                                <textarea
                                                    name="coverLetter"
                                                    value={formData.coverLetter}
                                                    onChange={handleInputChange}
                                                    rows={6}
                                                    placeholder="Tell us why you're a great fit for this position..."
                                                    required
                                                    minLength={10}
                                                    disabled={submitState === 'submitting'}
                                                />
                                                {formData.coverLetter.length > 0 && formData.coverLetter.length < 10 && (
                                                    <p style={{color:'#c62828', fontSize:'12px', marginTop:'4px'}}>
                                                        Cover letter must be at least 10 characters ({formData.coverLetter.length}/10)
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Error message */}
                                    {submitState === 'error' && submitError && (
                                        <div className="submit-error mb-20">
                                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx={12} cy={12} r={10} stroke="#c62828" strokeWidth={2} />
                                                <path d="M12 8V12M12 16H12.01" stroke="#c62828" strokeWidth={2} strokeLinecap="round" />
                                            </svg>
                                            {submitError}
                                        </div>
                                    )}

                                    <div className="form-inner">
                                        <button
                                            type="submit"
                                            className="primary-btn3 black-bg w-100"
                                            disabled={submitState === 'submitting'}
                                        >
                                            <span>
                                                {submitState === 'submitting' ? 'Submitting...' : 'Submit Application'}
                                            </span>
                                            <span>
                                                {submitState === 'submitting' ? 'Submitting...' : 'Submit Application'}
                                            </span>
                                            {submitState !== 'submitting' && (
                                                <svg className="arrow" width={23} height={23} viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                                                    <g>
                                                        <path d="M0.113861 0H22.9999V4.28425L4.32671 22.9997L0 18.7154L12.7524 6.08815L0.113861 6.20089V0Z" />
                                                        <path d="M23 22.9996V8.56848L16.8516 14.6566V22.9996H23Z" />
                                                    </g>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <FooterTop />
            <Footer1 />

            <style jsx>{`
                .job-card {
                    background: #fff;
                    padding: 40px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }

                .job-card:hover {
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
                    transform: translateY(-5px);
                }

                .job-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 20px;
                }

                .job-info h3 {
                    font-size: 28px;
                    margin-bottom: 15px;
                    color: #1a1a1a;
                }

                .job-meta {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                }

                .job-meta li {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    color: #0160b2;
                }

                .job-meta svg {
                    width: 16px;
                    height: 16px;
                    fill: currentColor;
                }

                .apply-btn {
                    white-space: nowrap;
                    min-width: 150px;
                }

                .job-description p,
                .job-requirements p {
                    color: #666;
                    line-height: 1.8;
                }

                .job-requirements {
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid #f0f0f0;
                }

                .job-requirements h5 {
                    font-size: 15px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: #1a1a1a;
                }

                .job-salary {
                    margin-top: 12px;
                    font-size: 14px;
                    color: #444;
                    font-weight: 500;
                }

                /* Modal */
                .career-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 20px;
                    overflow-y: auto;
                }

                .career-modal-content {
                    background: #fff;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 700px;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                    margin: auto;
                }

                .modal-close-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 5px;
                    color: #666;
                    transition: color 0.3s ease;
                    z-index: 10;
                }

                .modal-close-btn:hover {
                    color: #000;
                }

                .modal-header {
                    padding: 40px 40px 20px;
                    border-bottom: 1px solid #eee;
                }

                .modal-header h3 {
                    font-size: 28px;
                    margin-bottom: 10px;
                    color: #1a1a1a;
                }

                .modal-header p {
                    color: #666;
                    margin: 0;
                }

                .modal-body {
                    padding: 40px;
                }

                /* File upload */
                .file-upload-wrapper {
                    position: relative;
                }

                .file-input {
                    position: absolute;
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .file-upload-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 15px 20px;
                    background: #f5f5f5;
                    border: 2px dashed #ccc;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: #666;
                    font-size: 14px;
                    word-break: break-all;
                }

                .file-upload-label:hover {
                    background: #eee;
                    border-color: #999;
                }

                .file-upload-label svg {
                    flex-shrink: 0;
                    width: 20px;
                    height: 20px;
                    stroke: currentColor;
                }

                /* Submit feedback */
                .submit-error {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: #ffebee;
                    border: 1px solid #ef9a9a;
                    border-radius: 6px;
                    color: #c62828;
                    font-size: 14px;
                }

                .submit-success {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 20px 0;
                    gap: 16px;
                }

                .submit-success h4 {
                    font-size: 24px;
                    color: #1a1a1a;
                    margin: 0;
                }

                .submit-success p {
                    color: #666;
                    max-width: 400px;
                    line-height: 1.6;
                    margin: 0;
                }

                .mt-20 {
                    margin-top: 20px;
                }

                button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .job-header {
                        flex-direction: column;
                    }

                    .apply-btn {
                        width: 100%;
                    }

                    .modal-header,
                    .modal-body {
                        padding: 30px 20px;
                    }

                    .job-card {
                        padding: 25px;
                    }

                    .job-info h3 {
                        font-size: 22px;
                    }
                }
            `}</style>
        </>
    )
}

export default CareerPage