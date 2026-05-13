import React, { useEffect, useRef, useContext, useState } from 'react';
import { User as UserType, KycStatus } from '../../types';
import { MiningTierInfo } from '../../contexts/UserContext';
import { X, Share2, Download, Loader2 } from 'lucide-react';
import { AppContext } from '../../contexts/AppContext';

interface ShareProfileCardProps {
    user: UserType;
    miningTierInfo: MiningTierInfo;
    onClose: () => void;
}

const ShareProfileCard: React.FC<ShareProfileCardProps> = ({ user, miningTierInfo, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { showSuccessToast, showErrorToast } = useContext(AppContext);
    const [isGenerating, setIsGenerating] = useState(true);
    const [isSharing, setIsSharing] = useState(false);
    const [canShare, setCanShare] = useState(false);

    useEffect(() => {
        // Check for share API support
        if (navigator.share && typeof navigator.canShare === 'function') {
            setCanShare(true);
        }
    
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const width = 450;
        const height = 720;
        canvas.width = width * 2; // for better resolution
        canvas.height = height * 2;
        ctx.scale(2, 2);

        // --- Drawing Logic ---
        const drawCard = () => {
             // 1. Background
            const bgGradient = ctx.createRadialGradient(width / 2, -height * 0.2, 0, width / 2, 0, height * 1.5);
            bgGradient.addColorStop(0, '#1e3a8a');
            bgGradient.addColorStop(0.5, '#16181E');
            bgGradient.addColorStop(1, '#0B0C0F');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, width, height);
            
            // 2. Holographic border
            const holoGradient = ctx.createLinearGradient(0, 0, width, height);
            holoGradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
            holoGradient.addColorStop(0.25, 'rgba(100, 200, 255, 0.6)');
            holoGradient.addColorStop(0.5, 'rgba(37, 99, 235, 0.8)');
            holoGradient.addColorStop(0.75, 'rgba(255, 100, 200, 0.6)');
            holoGradient.addColorStop(1, 'rgba(59, 130, 246, 0.8)');
            ctx.strokeStyle = holoGradient;
            ctx.lineWidth = 3;
            ctx.strokeRect(1.5, 1.5, width - 3, height - 3);
            
            // 3. Header
            const chipX = 40, chipY = 50, chipW = 60, chipH = 45;
            const chipGradient = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
            chipGradient.addColorStop(0, '#e0e0e0');
            chipGradient.addColorStop(0.5, '#b0b0b0');
            chipGradient.addColorStop(1, '#d0d0d0');
            ctx.fillStyle = chipGradient;
            ctx.fillRect(chipX, chipY, chipW, chipH);
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(chipX + chipW / 2, chipY); ctx.lineTo(chipX + chipW / 2, chipY + chipH);
            ctx.moveTo(chipX, chipY + chipH / 2); ctx.lineTo(chipX + chipW, chipY + chipH / 2);
            ctx.moveTo(chipX + chipW / 4, chipY); ctx.lineTo(chipX + chipW / 4, chipY + chipH);
            ctx.moveTo(chipX + 3 * chipW / 4, chipY); ctx.lineTo(chipX + 3 * chipW / 4, chipY + chipH);
            ctx.stroke();

            ctx.font = 'bold 24px sans-serif';
            ctx.fillStyle = '#C8CDDA';
            ctx.textAlign = 'right';
            ctx.fillText('Trustrium', width - 40, 75);

            // 4. User Info (drawn after avatar)
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.font = 'bold 40px sans-serif';
            ctx.fillText(user.name, width / 2, 335);

            ctx.fillStyle = '#A9B1C5';
            ctx.font = '22px sans-serif';
            ctx.fillText(`@${user.username}`, width / 2, 370);
            
            // 5. Details Section
            const detailY = 420;
            // KYC
            ctx.fillStyle = '#A9B1C5';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('KYC STATUS', 40, detailY);
            const isVerified = user.kycStatus === KycStatus.Approved;
            const kycText = isVerified ? 'VERIFIED' : 'UNVERIFIED';
            const kycColor = isVerified ? '#22c55e' : '#f59e0b';
            ctx.fillStyle = kycColor;
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText(kycText, 40, detailY + 30);
            // TIER
            ctx.fillStyle = '#A9B1C5';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('MINING TIER', width - 40, detailY);
            ctx.fillStyle = '#3B82F6';
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText(miningTierInfo.name.toUpperCase(), width - 40, detailY + 30);

            // 6. Wallet Address
            const walletY = 520;
            ctx.fillStyle = '#A9B1C5';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('WALLET ADDRESS', 40, walletY);
            ctx.fillStyle = 'white';
            ctx.font = '18px monospace';
            const addr = user.walletAddress;
            const mid = Math.ceil(addr.length / 2); // Use ceil to ensure first part is not shorter
            const addr1 = addr.substring(0, mid);
            const addr2 = addr.substring(mid);
            ctx.fillText(addr1, 40, walletY + 30);
            ctx.fillText(addr2, 40, walletY + 55);
            
            // 7. Footer
            ctx.strokeStyle = '#41495D';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(40, height - 80);
            ctx.lineTo(width - 40, height - 80);
            ctx.stroke();

            ctx.font = 'bold 20px sans-serif';
            const logoGradient = ctx.createLinearGradient(0, 0, width, 0);
            logoGradient.addColorStop(0.3, '#3B82F6');
            logoGradient.addColorStop(0.7, '#2563EB');
            ctx.fillStyle = logoGradient;
            ctx.textAlign = 'center';
            ctx.fillText('Trustrium Mining', width / 2, height - 40);
        };
        
        const avatarImg = new Image();
        avatarImg.crossOrigin = 'Anonymous';
        avatarImg.src = user.avatar || `https://i.pravatar.cc/150?u=${user.id}`;
        
        const drawAvatar = () => {
            const avatarX = width / 2;
            const avatarY = 220;
            const avatarRadius = 60;
            
            // Glow
            ctx.shadowColor = '#2563EB';
            ctx.shadowBlur = 30;

            // Draw avatar in a circle
            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatarImg, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
            ctx.restore();
            
            // Border
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
            const borderGradient = ctx.createLinearGradient(avatarX - avatarRadius, avatarY - avatarRadius, avatarX + avatarRadius, avatarY + avatarRadius);
            borderGradient.addColorStop(0, '#3B82F6');
            borderGradient.addColorStop(1, '#1D4ED8');
            ctx.strokeStyle = borderGradient;
            ctx.lineWidth = 4;
            ctx.stroke();
            
            setIsGenerating(false);
        }

        avatarImg.onload = () => {
            drawCard();
            drawAvatar();
        };
        avatarImg.onerror = () => {
             showErrorToast('Could not load avatar image.');
             drawCard();
             // Draw placeholder avatar
             const avatarX = width / 2;
             const avatarY = 220;
             const avatarRadius = 60;
             ctx.fillStyle = '#2C313D';
             ctx.beginPath();
             ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
             ctx.fill();
             setIsGenerating(false);
        }

    }, [user, miningTierInfo]);
    
    const shareOrDownload = async (action: 'share' | 'download') => {
        const canvas = canvasRef.current;
        if (!canvas) {
            showErrorToast('Could not generate profile card.');
            return;
        }

        setIsSharing(true);
        canvas.toBlob(async (blob) => {
            if (!blob) {
                showErrorToast('Failed to create image file.');
                setIsSharing(false);
                return;
            }

            if (action === 'download') {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `trustrium-profile-${user.username}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showSuccessToast('Image downloaded!');
                setIsSharing(false);
                return;
            }

            const file = new File([blob], `trustrium-profile-${user.username}.png`, { type: 'image/png' });
            if (canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'My Trustrium Profile',
                        text: `Check out my profile on Trustrium! My username is @${user.username}.`
                    });
                    showSuccessToast('Profile shared!');
                } catch (error) {
                    console.error('Sharing failed:', error);
                    showErrorToast('Sharing was cancelled or failed.');
                }
            } else {
                 showErrorToast('Sharing not supported on this device/browser. Try downloading.');
            }
             setIsSharing(false);
        }, 'image/png');
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-gray-900 rounded-2xl p-6 w-full max-w-lg border border-brand-gray-700 shadow-2xl shadow-brand-blue/20" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">Share Profile</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-gray-700 transition-colors"><X size={24} className="text-brand-gray-400"/></button>
                </div>
                
                <div className="relative aspect-[450/720] bg-brand-gray-800 rounded-lg flex items-center justify-center">
                    {isGenerating && <Loader2 className="animate-spin text-brand-blue" size={48} />}
                    <canvas ref={canvasRef} className={`w-full h-full rounded-lg ${isGenerating ? 'hidden' : 'block'}`}></canvas>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <button 
                        onClick={() => shareOrDownload('download')} 
                        disabled={isGenerating || isSharing}
                        className="w-full py-3 font-semibold text-white bg-brand-gray-700 rounded-lg hover:bg-brand-gray-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                         {isSharing && !canShare ? <Loader2 className="animate-spin" size={20}/> : <Download size={20}/>}
                         Download
                    </button>
                    {canShare ? (
                        <button 
                            onClick={() => shareOrDownload('share')} 
                            disabled={isGenerating || isSharing}
                            className="w-full py-3 font-semibold text-white bg-brand-blue rounded-lg hover:bg-brand-blue-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSharing ? <Loader2 className="animate-spin" size={20}/> : <Share2 size={20}/>}
                            Share
                        </button>
                    ) : (
                         <div className="w-full py-3 font-semibold text-white bg-brand-blue rounded-lg flex items-center justify-center gap-2 opacity-50">
                            <Share2 size={20}/>
                            Share
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareProfileCard;