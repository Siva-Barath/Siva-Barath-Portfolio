/**
 * Siva Barath S - Portfolio Redesign Client Script
 * Implements visual background canvas physics, interactive node simulators,
 * image carousels, accordion controls, and intersection observer transitions.
 */

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    // Word Rotator Animation
    const words = document.querySelectorAll('.word-rotator .word');
    if (words.length > 0) {
        let currentIndex = 0;
        setInterval(() => {
            const currentWord = words[currentIndex];
            currentWord.classList.remove('active');
            currentWord.classList.add('exit');
            
            setTimeout(() => {
                currentWord.classList.remove('exit');
            }, 600);

            currentIndex = (currentIndex + 1) % words.length;
            const nextWord = words[currentIndex];
            nextWord.classList.add('active');
        }, 3000);
    }

    // -------------------------------------------------------------
    // 1. Mobile Navigation Toggle
    // -------------------------------------------------------------
    const navbar = document.getElementById('navbar');
    const navLinksContainer = document.getElementById('nav-links');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    if (mobileToggle && navLinksContainer) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = navLinksContainer.classList.contains('open');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });
    }

    function openMobileMenu() {
        mobileToggle.classList.add('open');
        navLinksContainer.classList.add('open');
        body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileToggle.classList.remove('open');
        navLinksContainer.classList.remove('open');
        body.style.overflow = '';
    }

    // Global cursor tracking coordinates
    const globalMouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
    window.addEventListener('mousemove', (e) => {
        globalMouse.targetX = e.clientX;
        globalMouse.targetY = e.clientY;
    });

    // Lerp coordinates for smooth mouse glow tracking
    function updateMouseGlow() {
        globalMouse.x += (globalMouse.targetX - globalMouse.x) * 0.08;
        globalMouse.y += (globalMouse.targetY - globalMouse.y) * 0.08;
    }

    // -------------------------------------------------------------
    // 2. Fullscreen Background System Canvas (#bg-canvas)
    // -------------------------------------------------------------
    const bgCanvas = document.getElementById('bg-canvas');
    if (bgCanvas) {
        const bgCtx = bgCanvas.getContext('2d');
        
        let bgWidth = bgCanvas.width = window.innerWidth;
        let bgHeight = bgCanvas.height = window.innerHeight;
        
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.addEventListener('scroll', () => {
            scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        });

        // Initialize 60 twinkling star structures
        const stars = [];
        for (let i = 0; i < 60; i++) {
            stars.push({
                x: Math.random() * bgWidth,
                y: Math.random() * bgHeight,
                size: 0.5 + Math.random() * 1.2,
                alpha: Math.random(),
                speed: 0.005 + Math.random() * 0.015,
                phase: Math.random() * Math.PI
            });
        }

        // Initialize 30 background floating nodes
        const bgParticles = [];
        for (let i = 0; i < 30; i++) {
            bgParticles.push({
                x: Math.random() * bgWidth,
                y: Math.random() * bgHeight,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
                radius: 1 + Math.random() * 1.5,
                alpha: 0.1 + Math.random() * 0.2
            });
        }

        window.addEventListener('resize', () => {
            bgWidth = bgCanvas.width = window.innerWidth;
            bgHeight = bgCanvas.height = window.innerHeight;
        });

        // Background Animation Draw Function
        function drawBackground() {
            bgCtx.clearRect(0, 0, bgWidth, bgHeight);
            updateMouseGlow();

            // A. Draw subtle Vercel/Linear-style grid overlay with Parallax scroll offset
            const gridSpacing = 64;
            const gridOffset = (scrollTop * 0.15) % gridSpacing;
            
            bgCtx.beginPath();
            bgCtx.strokeStyle = 'rgba(255, 255, 255, 0.004)';
            bgCtx.lineWidth = 1;

            // Vertical lines
            for (let x = 0; x < bgWidth; x += gridSpacing) {
                bgCtx.moveTo(x, 0);
                bgCtx.lineTo(x, bgHeight);
            }
            // Horizontal lines (offset scroll)
            for (let y = -gridOffset; y < bgHeight; y += gridSpacing) {
                bgCtx.moveTo(0, y);
                bgCtx.lineTo(bgWidth, y);
            }
            bgCtx.stroke();

            // B. Draw Twinkling Stars (Glitter effects)
            for (let i = 0; i < stars.length; i++) {
                const star = stars[i];
                // Twinkle alpha updates
                star.phase += star.speed;
                const starAlpha = 0.03 + Math.abs(Math.sin(star.phase)) * 0.35;
                
                // Slowly scroll stars upwards (parallax)
                let starY = (star.y - (scrollTop * 0.05)) % bgHeight;
                if (starY < 0) starY += bgHeight;

                bgCtx.beginPath();
                bgCtx.arc(star.x, starY, star.size, 0, Math.PI * 2);
                bgCtx.fillStyle = `rgba(255, 255, 255, ${starAlpha})`;
                bgCtx.fill();
            }

            // C. Draw drifting faint background particles and connections (Linear-style)
            for (let i = 0; i < bgParticles.length; i++) {
                const bp = bgParticles[i];

                // Slow updates
                bp.x += bp.vx;
                bp.y += bp.vy;

                // Bounce boundaries
                if (bp.x < 0 || bp.x > bgWidth) bp.vx *= -1;
                if (bp.y < 0 || bp.y > bgHeight) bp.vy *= -1;

                // Adjust drawing position based on scrolling parallax
                let bpY = (bp.y - (scrollTop * 0.1)) % bgHeight;
                if (bpY < 0) bpY += bgHeight;

                bgCtx.beginPath();
                bgCtx.arc(bp.x, bpY, bp.radius, 0, Math.PI * 2);
                bgCtx.fillStyle = `rgba(255, 255, 255, ${bp.alpha})`;
                bgCtx.fill();

                // Links connecting nearby background particles
                for (let j = i + 1; j < bgParticles.length; j++) {
                    const bp2 = bgParticles[j];
                    let bp2Y = (bp2.y - (scrollTop * 0.1)) % bgHeight;
                    if (bp2Y < 0) bp2Y += bgHeight;

                    const dx = bp.x - bp2.x;
                    const dy = bpY - bp2Y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        const alpha = (1 - dist / 150) * 0.025;
                        bgCtx.beginPath();
                        bgCtx.moveTo(bp.x, bpY);
                        bgCtx.lineTo(bp2.x, bp2Y);
                        bgCtx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                        bgCtx.lineWidth = 0.5;
                        bgCtx.stroke();
                    }
                }
            }

            // D. Draw Mouse Reactive Light Glow
            if (globalMouse.x > -500) {
                const gradient = bgCtx.createRadialGradient(
                    globalMouse.x, globalMouse.y, 0,
                    globalMouse.x, globalMouse.y, 350
                );
                gradient.addColorStop(0, 'rgba(99, 102, 241, 0.04)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                bgCtx.beginPath();
                bgCtx.arc(globalMouse.x, globalMouse.y, 350, 0, Math.PI * 2);
                bgCtx.fillStyle = gradient;
                bgCtx.fill();
            }

            requestAnimationFrame(drawBackground);
        }

        // Initialize background canvas animation
        drawBackground();
    }

    // -------------------------------------------------------------
    // 3. Project Details Modal Dynamic System
    // -------------------------------------------------------------
    // -------------------------------------------------------------
    // 3. Project Details Modal Dynamic System
    // -------------------------------------------------------------
    const projectData = {
        'waste-mgmt': {
            title: 'Smart Waste Management',
            subtitle: 'AI-powered smart city waste management system developed for India Innovates 2026.',
            chips: ['India Innovates Finalist', 'Route Optimization', 'IoT Integration'],
            metrics: [
                { val: '100+', lbl: 'Simulated Houses' },
                { val: '3', lbl: 'Truck Clusters' },
                { val: 'Real', lbl: 'Road Networks' },
                { val: 'Top 68', lbl: 'National Finalist' }
            ],
            overview: 'Developed for India Innovates 2026, this project optimizes municipal waste collection routes using real road networks, dynamic truck allocation, and IoT hardware simulations.',
            problemStatement: 'Traditional waste collection processes follow static, unoptimized routes. This results in unnecessary travel distance, fuel wastage, labor inefficiency, and delayed response to filled containers.',
            keyFeatures: [
                'Real Road Network Routing utilizing spatial street graphs from OSMnx.',
                'Dijkstra-based shortest path calculations for precise vehicle navigation.',
                'Multi-truck route allocation based on optimized distance coordinates.',
                'KMeans clustering to partition cities into balanced, non-overlapping collection zones.',
                'ESP32 IoT bin monitoring using ultrasonic sensors and HTTP telemetry.',
                'Live web dashboard visualization for system status monitoring.',
                'Real-time truck movement simulation along calculated routes.'
            ],
            techStack: {
                'Frontend': ['Leaflet.js', 'HTML5', 'CSS3', 'JavaScript'],
                'Backend': ['Flask', 'Python'],
                'Optimization': ['NetworkX', 'OSMnx', 'KMeans'],
                'Hardware': ['ESP32', 'Ultrasonic Sensor']
            },
            achievement: [
                'Selected as National Finalist in India Innovates 2026.',
                'Top 68 teams out of 1050+ submissions nationwide.',
                'Secured 10th Place in the competitive Urban Solutions Domain.'
            ],
            codeUrl: 'https://github.com/Siva-Barath/Route-Optimization-for-Smart-Waste-Management-System'
        },
        'chronic-disease': {
            title: 'Chronic Disease Alert System',
            subtitle: 'Healthcare AI platform predicting disease progressions, digitizing prescriptions, and storing records.',
            chips: ['Healthcare AI', 'OCR Digitization', 'Dynamic Dashboard'],
            metrics: [
                { val: 'OCR', lbl: 'Prescription Parsing' },
                { val: 'AI', lbl: 'Disease Prediction' },
                { val: 'Digital', lbl: 'Health Records' },
                { val: 'Role-Based', lbl: 'Access Control' }
            ],
            overview: 'An advanced clinical platform designed to digitize handwritten medical prescriptions, run machine learning prognostics to predict disease progressions, and display records through a secure dashboard.',
            problemStatement: 'Handwritten medical prescriptions suffer from readability issues and physical records are difficult to track. Patient clinical charts lack proactive predictive models to alert providers of progressive health risks.',
            keyFeatures: [
                'Prescription digitization using PyTesseract OCR and OpenCV image processing.',
                'Chronic disease progression prediction via trained Scikit-learn Random Forest engines.',
                'Dynamic clinical dashboard showing health parameter trendlines.',
                'Patient and Doctor portals equipped with secure logins.',
                'Proactive alert triggers warning patients of anomalous diagnostic swings.'
            ],
            techStack: {
                'Frontend': ['HTML5', 'CSS3', 'JavaScript', 'Chart.js'],
                'Backend': ['Flask', 'Python'],
                'Database': ['MongoDB'],
                'Machine Learning': ['Scikit-Learn', 'Pandas', 'NumPy']
            },
            achievement: [
                'Successfully digitized prescriptions with high character parsing accuracy.',
                'Maintained low diagnostic prediction latency across core patient profiles.',
                'Engineered role-based authentication protocols for patient privacy compliance.'
            ],
            codeUrl: 'https://github.com/Siva-Barath/Chronic-Disease-Predictor'
        },
        'payease': {
            title: 'PAYEASE',
            subtitle: 'Full-stack MERN application for mobile recharge coordination with digital wallet registers.',
            chips: ['MERN Stack', 'Secure Transactional Wallet', 'Activity Auditing'],
            metrics: [
                { val: 'JWT', lbl: 'Secure Auth' },
                { val: 'Digital', lbl: 'Wallet System' },
                { val: 'MERN', lbl: 'Full Stack' },
                { val: 'Instant', lbl: 'Transaction Logs' }
            ],
            overview: 'A full-stack web application implementing a mock mobile recharge service connected to a secure digital account wallet register system.',
            problemStatement: 'Traditional payment interfaces often lack immediate transactional logging feedback loops and wallet-balance checking states, leading to poor visual feedback and transactional insecurity.',
            keyFeatures: [
                'Secure session tracking utilizing JSON Web Tokens (JWT) and cookies.',
                'Encrypted credential storage via bcrypt password hashing algorithms.',
                'Digital wallet ledger supporting mock credit, debit, and charging mechanisms.',
                'Mongoose transaction schemas preventing wallet balance overdraws.',
                'Instant search-filtered logs auditing all transaction actions.'
            ],
            techStack: {
                'Frontend': ['React.js', 'React Router', 'CSS Modules'],
                'Backend': ['Node.js', 'Express.js'],
                'Database': ['MongoDB', 'Mongoose'],
                'Security': ['JWT', 'bcrypt Hashing']
            },
            achievement: [
                'Developed high-concurrency database schemas for ledger operations.',
                'Achieved complete authorization safety across private dashboard routes.',
                'Configured responsive desktop-mobile application layouts.'
            ],
            codeUrl: 'https://github.com/Siva-Barath/PAYEASE'
        },
        'assistant': {
            title: 'AI Desktop Assistant',
            subtitle: 'Voice desktop assistant program incorporating face access recognition and LLM automation.',
            chips: ['Generative AI', 'Computer Vision', 'Voice Processing'],
            metrics: [
                { val: 'Face', lbl: 'Recognition' },
                { val: 'Voice', lbl: 'Commands' },
                { val: 'Gemini', lbl: 'Integration' },
                { val: 'System', lbl: 'Automation' }
            ],
            overview: 'A secure, voice-activated desktop assistant utility linking local system controls to cloud LLM processing networks, protected by face authentication.',
            problemStatement: 'Voice control applications lack local system security controls. Anyone speaking to the device could trigger administrative shell commands, compromising local files and settings.',
            keyFeatures: [
                'Local facial recognition check using OpenCV Haar Cascade algorithms.',
                'Voice commands parsed using offline-capable SpeechRecognition mapping.',
                'Conversational context and query processing via Google Gemini LLM API.',
                'Safe execution controls automating browser triggers, search queries, and local system tools.',
                'Custom desktop interface showing active diagnostic states.'
            ],
            techStack: {
                'GUI / Frontend': ['PyQt5', 'QSS (Qt Style Sheets)'],
                'Core Logic': ['Python', 'SpeechRecognition'],
                'Computer Vision': ['OpenCV (Haar Cascades)'],
                'APIs': ['Google Gemini API', 'PyTTSx3 Speech Engine']
            },
            achievement: [
                'Engineered passwordless facial unlock system executing in under 1 second.',
                'Secured command routes by restricting automation actions to authenticated faces.',
                'Integrated semantic voice parsing with natural language conversational agents.'
            ],
            codeUrl: null
        }
    };

    const projectModal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body-content');
    const modalClose = document.querySelector('.modal-close');
    const detailButtons = document.querySelectorAll('.btn-details');

    if (projectModal && modalBody) {
        detailButtons.forEach(button => {
            button.addEventListener('click', () => {
                const projectId = button.getAttribute('data-project');
                const data = projectData[projectId];
                if (!data) return;

                // Build chips HTML
                const chipsHtml = data.chips.map(chip => `<span class="metric-chip">${chip}</span>`).join('');
                
                // Build metrics grid HTML
                const metricsHtml = data.metrics.map(m => `
                    <div class="modal-metric-card">
                        <span class="m-metric-val">${m.val}</span>
                        <span class="m-metric-lbl">${m.lbl}</span>
                    </div>
                `).join('');
                
                // Build feature bullets HTML
                const featuresHtml = data.keyFeatures.map(f => `<li>${f}</li>`).join('');

                // Build tech categories HTML
                const techStackHtml = Object.entries(data.techStack).map(([category, items]) => `
                    <div class="modal-tech-group">
                        <div class="modal-tech-group-title">${category}</div>
                        <div class="modal-tech-pills">
                            ${items.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                        </div>
                    </div>
                `).join('');

                // Build achievements HTML
                const achievementHtml = data.achievement.map(a => `<li>${a}</li>`).join('');

                // Build code/link HTML
                let footerHtml = '';
                if (data.codeUrl) {
                    footerHtml = `
                        <a href="${data.codeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 8px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                            <span>View Source Code</span>
                        </a>
                    `;
                } else {
                    footerHtml = `
                        <div class="project-link disabled" title="Repository is local/private" style="display: inline-flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--text-tertiary);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon"><path d="M12 15v5m-3-2h6m-6-8V6a3 3 0 0 1 6 0v2m-9 7h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2z"/></svg>
                            <span>Local Project (Private Repository)</span>
                        </div>
                    `;
                }

                // Inject content
                modalBody.innerHTML = `
                    <div class="modal-header">
                        <div class="modal-title-area">
                            <div class="modal-chips">
                                ${chipsHtml}
                            </div>
                            <h3 class="modal-title">${data.title}</h3>
                            <p class="modal-subtitle">${data.subtitle}</p>
                        </div>
                    </div>
                    
                    <div class="modal-metrics-grid">
                        ${metricsHtml}
                    </div>

                    <div class="modal-grid-details-new">
                        <div class="modal-col">
                            <div class="modal-detail-section">
                                <h4>Overview</h4>
                                <p>${data.overview}</p>
                            </div>
                            <div class="modal-detail-section">
                                <h4>Problem Statement</h4>
                                <p>${data.problemStatement}</p>
                            </div>
                            <div class="modal-detail-section">
                                <h4>Key Features</h4>
                                <ul class="modal-features-list">
                                    ${featuresHtml}
                                </ul>
                            </div>
                        </div>
                        <div class="modal-col">
                            <div class="modal-detail-section">
                                <h4>Tech Stack</h4>
                                <div class="modal-tech-stack-wrapper">
                                    ${techStackHtml}
                                </div>
                            </div>
                            <div class="modal-detail-section">
                                <h4>Achievements &amp; Highlights</h4>
                                <ul class="modal-features-list">
                                    ${achievementHtml}
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        ${footerHtml}
                    </div>
                `;

                // Open modal
                projectModal.classList.add('active');
                projectModal.setAttribute('aria-hidden', 'false');
                body.style.overflow = 'hidden';
            });
        });

        // Close functions
        const closeModal = () => {
            projectModal.classList.remove('active');
            projectModal.setAttribute('aria-hidden', 'true');
            body.style.overflow = '';
        };

        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }

        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal || e.target.classList.contains('modal-backdrop')) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && projectModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // -------------------------------------------------------------
    // 5. Achievement Image Slide Galleries (Centerpiece & Subcards)
    // -------------------------------------------------------------
    const galleries = document.querySelectorAll('.achievement-gallery-container');
    galleries.forEach(gallery => {
        const wrapper = gallery.querySelector('.gallery-wrapper');
        const slides = gallery.querySelectorAll('.gallery-slide');
        const indicators = gallery.querySelectorAll('.indicator');
        const prevBtn = gallery.querySelector('.prev-btn');
        const nextBtn = gallery.querySelector('.next-btn');
        
        let index = 0;

        function showSlide(newIndex) {
            if (newIndex < 0) {
                index = slides.length - 1;
            } else if (newIndex >= slides.length) {
                index = 0;
            } else {
                index = newIndex;
            }

            slides.forEach((slide, i) => {
                if (i === index) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            indicators.forEach((ind, i) => {
                if (i === index) {
                    ind.classList.add('active');
                } else {
                    ind.classList.remove('active');
                }
            });

            wrapper.setAttribute('data-active-index', index);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showSlide(index - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showSlide(index + 1);
            });
        }

        indicators.forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetIdx = parseInt(indicator.getAttribute('data-index'), 10);
                showSlide(targetIdx);
            });
        });
    });

    // -------------------------------------------------------------
    // 6. Lightbox Fullscreen Asset Viewer (Image Viewer)
    // -------------------------------------------------------------
    const viewer = document.getElementById('image-viewer');
    const viewerImg = document.getElementById('viewer-img');
    const viewerCaption = document.getElementById('viewer-caption');
    const viewerClose = document.querySelector('.viewer-close');

    const viewableImages = document.querySelectorAll('.gallery-img, .cert-preview-img');
    viewableImages.forEach(image => {
        image.addEventListener('click', () => {
            if (!viewer || !viewerImg) return;
            viewerImg.src = image.src;
            viewerCaption.textContent = image.alt || 'Asset View';
            viewer.classList.add('show');
            viewer.setAttribute('aria-hidden', 'false');
            body.style.overflow = 'hidden';
        });
    });

    if (viewer) {
        viewerClose.addEventListener('click', closeViewer);
        viewer.addEventListener('click', (e) => {
            if (e.target === viewer || e.target === viewerClose) {
                closeViewer();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && viewer.classList.contains('show')) {
                closeViewer();
            }
        });
    }

    function closeViewer() {
        if (!viewer) return;
        viewer.classList.remove('show');
        viewer.setAttribute('aria-hidden', 'true');
        body.style.overflow = '';
        setTimeout(() => {
            if (viewerImg) viewerImg.src = '';
        }, 300);
    }

    // -------------------------------------------------------------
    // 7. Scroll Fade-in Triggers (Intersection Observer)
    // -------------------------------------------------------------
    const animElements = document.querySelectorAll(
        '.skills-card, .project-card, .achievement-card, .cert-card, .timeline-content, .profile-card, .contact-container, .section-header'
    );
    
    animElements.forEach(el => {
        el.classList.add('fade-in-element');
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
    });

    animElements.forEach(el => {
        revealObserver.observe(el);
    });

    // -------------------------------------------------------------
    // 8. Active Header Link Highlighting on Scroll
    // -------------------------------------------------------------
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.25,
        rootMargin: '-20% 0px -50% 0px'
    });

    sections.forEach(section => {
        scrollObserver.observe(section);
    });

    // -------------------------------------------------------------
    // 9. Mouse Hover Gradient Glows
    // -------------------------------------------------------------
    const glowCards = document.querySelectorAll('.skills-card, .project-card, .achievement-card, .cert-card, .education-card, .profile-card');
    glowCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});
