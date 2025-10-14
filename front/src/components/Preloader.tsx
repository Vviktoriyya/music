type PreloaderProps = {
    size?: number;
    message?: string;
};

export default function Preloader({ size = 140, message = "Завантаження..." }: PreloaderProps) {
    const px = `${size}px`;

    return (
        <div
            role="status"
            aria-live="polite"
            className="flex flex-col items-center justify-center min-h-screen bg-transparent px-6"
        >
            <div
                className="flex items-center justify-center"
                style={{ width: px, height: px }}
            >
                <svg
                    viewBox="0 0 120 120"
                    width={px}
                    height={px}
                    xmlns="http://www.w3.org/2000/svg"
                    className="transform-gpu"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id="g1" x1="0" x2="1">
                            <stop offset="0%" stopColor="#60A5FA" stopOpacity="1" />
                            <stop offset="100%" stopColor="#7C3AED" stopOpacity="1" />
                        </linearGradient>

                        <filter id="f1" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Outer dashed ring (slow rotation) */}
                    <g transform="translate(60,60)">
                        <circle
                            r="40"
                            fill="none"
                            stroke="url(#g1)"
                            strokeWidth="6"
                            strokeDasharray="6 10"
                            strokeLinecap="round"
                            className="opacity-80"
                        >
                            <animateTransform
                                attributeName="transform"
                                type="rotate"
                                from="0"
                                to="360"
                                dur="6s"
                                repeatCount="indefinite"
                            />
                        </circle>

                        {/* Inner solid ring (faster rotation, subtle) */}
                        <circle
                            r="28"
                            fill="none"
                            stroke="#E6EEF8"
                            strokeWidth="8"
                            strokeLinecap="round"
                            className="opacity-60"
                            transform="rotate(0)"
                        >
                            <animateTransform
                                attributeName="transform"
                                type="rotate"
                                from="360"
                                to="0"
                                dur="3.5s"
                                repeatCount="indefinite"
                            />
                        </circle>

                        {/* Comet / dot traveling around the ring */}
                        <g filter="url(#f1)">
                            <circle cx="0" cy="-40" r="5" fill="#fff" className="shadow-lg">
                                <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="0"
                                    to="360"
                                    dur="1.6s"
                                    repeatCount="indefinite"
                                    additive="sum"
                                />
                            </circle>

                            {/* small tail for the comet */}
                            <path
                                d="M0 -40 q6 6 14 10"
                                stroke="url(#g1)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                fill="none"
                                opacity="0.9"
                            >
                                <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="0"
                                    to="360"
                                    dur="1.6s"
                                    repeatCount="indefinite"
                                    additive="sum"
                                />
                            </path>
                        </g>
                    </g>

                    {/* Three bouncing dots in the center (CSS-like timing via SMIL) */}
                    <g transform="translate(60,90)">
                        <circle cx="-18" cy="0" r="4" fill="#7C3AED">
                            <animate
                                attributeName="cy"
                                values="0;-8;0"
                                dur="0.8s"
                                begin="0s"
                                repeatCount="indefinite"
                                calcMode="spline"
                                keySplines="0.25 0.1 0.25 1;0.25 0.1 0.25 1"
                            />
                            <animate
                                attributeName="opacity"
                                values="0.6;1;0.6"
                                dur="0.8s"
                                begin="0s"
                                repeatCount="indefinite"
                            />
                        </circle>

                        <circle cx="0" cy="0" r="4" fill="#60A5FA">
                            <animate
                                attributeName="cy"
                                values="0;-10;0"
                                dur="0.8s"
                                begin="0.15s"
                                repeatCount="indefinite"
                                calcMode="spline"
                                keySplines="0.25 0.1 0.25 1;0.25 0.1 0.25 1"
                            />
                            <animate
                                attributeName="opacity"
                                values="0.6;1;0.6"
                                dur="0.8s"
                                begin="0.15s"
                                repeatCount="indefinite"
                            />
                        </circle>

                        <circle cx="18" cy="0" r="4" fill="#34D399">
                            <animate
                                attributeName="cy"
                                values="0;-8;0"
                                dur="0.8s"
                                begin="0.3s"
                                repeatCount="indefinite"
                                calcMode="spline"
                                keySplines="0.25 0.1 0.25 1;0.25 0.1 0.25 1"
                            />
                            <animate
                                attributeName="opacity"
                                values="0.6;1;0.6"
                                dur="0.8s"
                                begin="0.3s"
                                repeatCount="indefinite"
                            />
                        </circle>
                    </g>
                </svg>
            </div>

            {/* Візуальний текст під лоадером */}
            <div className="mt-4 text-center">
                <p className="text-sm font-medium text-gray-600">{message}</p>
            </div>

            {/* Для screen-reader */}
            <span className="sr-only">Завантажується, будь ласка зачекайте</span>
        </div>
    );
}
