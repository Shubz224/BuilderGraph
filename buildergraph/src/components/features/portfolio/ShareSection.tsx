import React, { useState } from 'react';
import { Link, Check, FileText, Linkedin, Twitter, Lightbulb } from 'lucide-react';

const ShareSection: React.FC = () => {
    const [copied, setCopied] = useState(false);

    const profileUrl = window.location.href;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 mb-12 border border-white/5 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
                Share Your Profile
            </h3>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleCopyLink}
                    className={`
            flex-1 px-6 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2
            ${copied
                            ? 'bg-accent text-white shadow-[0_0_20px_rgba(123,97,255,0.3)]'
                            : 'bg-white/5 border border-white/10 text-text-primary hover:bg-white/10 hover:border-white/20'
                        }
          `}
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4" /> Copied!
                        </>
                    ) : (
                        <>
                            <Link className="w-4 h-4" /> Copy Link
                        </>
                    )}
                </button>

                <button className="flex-1 px-6 py-3.5 rounded-xl font-medium bg-white/5 border border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/10 hover:border-white/20 transition flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" /> Download PDF
                </button>

                <div className="flex gap-2">
                    <a
                        href="#"
                        className="px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-[#0077b5] hover:bg-[#0077b5]/10 hover:border-[#0077b5]/30 transition flex items-center justify-center"
                        title="Share on LinkedIn"
                    >
                        <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                        href="#"
                        className="px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:text-white hover:bg-white/10 hover:border-white/20 transition flex items-center justify-center"
                        title="Share on Twitter"
                    >
                        <Twitter className="w-5 h-5" />
                    </a>
                </div>
            </div>

            <div className="flex items-center gap-2 text-text-secondary text-sm mt-6 bg-white/5 p-3 rounded-lg inline-flex">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span>Tip: Send this link to recruiters to showcase your verified reputation</span>
            </div>
        </div>
    );
};

export { ShareSection };
