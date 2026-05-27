"use client";
import React from "react";

const SalesNetworkSection: React.FC = () => {
    const salesData = [
        {
            label: "Steel — Monthly Volume",
            value: "10,000+ MT (combined TMT & Structurals)",
            col: "left",
        },
        {
            label: "Vizag TMT (RINL)",
            value: "5,000–,500 MT / month",
            col: "right",
        },
        {
            label: "Shyam Steel TMT",
            value: "2000 MT / month",
            col: "left",
        },
        {
            label: "MS Structurals",
            value: "2,000–2,500 MT / month",
            col: "right",
        },
        {
            label: "Cement (Trade)",
            value: "6,000–8,000 MT / month",
            col: "left",
        },
        {
            label: "Cement (C&F)",
            value: "5,000 MT / month",
            col: "right",
        },
        {
            label: "Birla White & Putty",
            value: "4,500 MT / month (No.1 Kerala FY25)",
            col: "left",
        },
        {
            label: "Dulux Paint Dealers",
            value: "102 dealers (Thrissur, Palakkad, Malappuram)",
            col: "right",
        },
    ];

    const rows = [
        { left: salesData[0], right: salesData[1] },
        { left: salesData[2], right: salesData[3] },
        { left: salesData[4], right: salesData[5] },
        { left: salesData[6], right: salesData[7] },
    ];

    return (
        <>
            <style>{`
                .sales-network-section {
                    padding: 80px 0 80px;
                    background: #f4f7fb;
                    position: relative;
                    overflow: hidden;
                }

                /* background watermark number to match infra section style */
                .sales-network-section::before {
                    // content: '2';
                    position: absolute;
                    right: -20px;
                    bottom: -60px;
                    font-size: clamp(180px, 22vw, 300px);
                    font-weight: 900;
                    color: rgba(30, 80, 180, 0.04);
                    line-height: 1;
                    pointer-events: none;
                    user-select: none;
                }

                .sales-network-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px;
                }

                /* ── Title ── */
                .sales-network-title-wrap {
                    text-align: center;
                    margin-bottom: 52px;
                }

                .sales-network-title-wrap .sn-eyebrow {
                    display: inline-block;
                    font-size: 11px;
                  
                    letter-spacing: 0.22em;
                    text-transform: uppercase;
                    color: #1a4fba;
                    margin-bottom: 12px;
                }

                .sales-network-title-wrap h2 {
                    font-size: clamp(26px, 3.5vw, 60px);
                    
                    color: #0d1f4e;
                    margin: 0;
                    line-height: 1.2;
                }

                /* ── Grid ── */
                .sn-grid {
                    border: 1.5px solid #c8d8f0;
                    border-radius: 0px;
                    overflow: hidden;
                    box-shadow: 0 4px 32px rgba(26, 79, 186, 0.07);
                    background: #fff;
                }

                .sn-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    border-bottom: 1.5px solid #c8d8f0;
                }

                .sn-row:last-child {
                    border-bottom: none;
                }

                .sn-cell {
                    padding: 22px 32px;
                    background: #e8f0fb;
                    border-right: 1.5px solid #c8d8f0;
                    transition: background 0.22s ease;
                }

                .sn-cell:last-child {
                    border-right: none;
                }

                .sn-cell:hover {
                    background: #d6e5f8;
                }

                .sn-cell-label {
                    font-size: 13px;
                    font-weight: 700;
                    color: #1a4fba;
                    margin-bottom: 5px;
                    letter-spacing: 0.01em;
                }

                .sn-cell-value {
                    font-size: 14.5px;
                    font-weight: 400;
                    color: #2d3a5e;
                    line-height: 1.5;
                }

                /* ── Bottom stat bar ── */
                .sn-stat-bar {
                    display: flex;
                    gap: 0;
                    margin-top: 36px;
                    border: 1.5px solid #c8d8f0;
                    border-radius: 0px;
                    overflow: hidden;
                    background: #1a4fba;
                }

                .sn-stat {
                    flex: 1;
                    padding: 24px 20px;
                    text-align: center;
                    border-right: 1px solid rgba(255,255,255,0.15);
                    transition: background 0.22s;
                }

                .sn-stat:last-child {
                    border-right: none;
                }

                .sn-stat:hover {
                    background: rgba(255,255,255,0.08);
                }

                .sn-stat-number {
                    font-size: clamp(22px, 2.8vw, 32px);
                    font-weight: 800;
                    color: #fff;
                    line-height: 1;
                    margin-bottom: 6px;
                }

                .sn-stat-desc {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.7);
                }

                @media (max-width: 640px) {
                    .sn-row {
                        grid-template-columns: 1fr;
                    }
                    .sn-cell {
                        border-right: none;
                        border-bottom: 1.5px solid #c8d8f0;
                        padding: 18px 20px;
                    }
                    .sn-cell:last-child {
                        border-bottom: none;
                    }
                    .sn-stat-bar {
                        flex-direction: column;
                    }
                    .sn-stat {
                        border-right: none;
                        border-bottom: 1px solid rgba(255,255,255,0.15);
                    }
                    .sn-stat:last-child {
                        border-bottom: none;
                    }
                }
            `}</style>

            <div className="sales-network-section">
                <div className="sales-network-inner">

                    {/* ── Section Title ── */}
                    <div className="sales-network-title-wrap wow animate fadeInDown" data-wow-delay="200ms" data-wow-duration="1500ms">
                       
                         <div className="section-title two text-center mt-5">
                                {/* <span>Our Capabilities</span> */}
                               <h2>Sales Network at a Glance</h2>
                            </div>
                    </div>


                    {/* ── Data Grid ── */}
                    <div className="sn-grid wow animate fadeInUp" data-wow-delay="200ms" data-wow-duration="1500ms">
                        {rows.map((row, i) => (
                            <div className="sn-row" key={i}>
                                <div className="sn-cell">
                                    <div className="sn-cell-label">{row.left.label}</div>
                                    <div className="sn-cell-value">{row.left.value}</div>
                                </div>
                                <div className="sn-cell">
                                    <div className="sn-cell-label">{row.right.label}</div>
                                    <div className="sn-cell-value">{row.right.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Summary Stat Bar ── */}
                    <div className="sn-stat-bar wow animate fadeInUp" data-wow-delay="300ms" data-wow-duration="1500ms">
                        <div className="sn-stat">
                            <div className="sn-stat-number">10,000+</div>
                            <div className="sn-stat-desc">MT Steel / Month</div>
                        </div>
                        <div className="sn-stat">
                            <div className="sn-stat-number">11,000+</div>
                            <div className="sn-stat-desc">MT Cement / Month</div>
                        </div>
                        <div className="sn-stat">
                            <div className="sn-stat-number">4,500</div>
                            <div className="sn-stat-desc">MT Birla White / Month</div>
                        </div>
                        <div className="sn-stat">
                            <div className="sn-stat-number">102</div>
                            <div className="sn-stat-desc">Dulux Paint Dealers</div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default SalesNetworkSection;