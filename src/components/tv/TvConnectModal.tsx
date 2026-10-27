import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import {
  ExternalLink,
  Cast,
  Wifi,
  Volume2,
  Copy,
  Check,
  MonitorPlay,
} from 'lucide-react';
import { playChime, speakOrderReady } from '../../utils/audioAnnouncer';

interface TvConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TvConnectModal: React.FC<TvConnectModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [castStatus, setCastStatus] = useState<string | null>(null);

  const localTvUrl = `${window.location.origin}/?view=tv`;
  const lanTvUrl = `http://192.168.1.26:5174/?view=tv`;

  const handleOpenWindow = () => {
    const tvWin = window.open(
      localTvUrl,
      'ServeFlow_Customer_TV',
      'menubar=no,toolbar=no,location=no,status=no,width=1920,height=1080'
    );
    if (tvWin) {
      tvWin.focus();
    } else {
      alert('Pop-up was blocked. Please allow pop-ups for this site to open the TV window.');
    }
  };

  const handleLaunchCast = async () => {
    setCastStatus(null);
    try {
      // Check for W3C Presentation API
      if ('PresentationRequest' in window) {
        const presentationRequest = new (window as any).PresentationRequest([localTvUrl]);
        setCastStatus('Opening Chrome Cast device picker...');
        const connection = await presentationRequest.start();
        setCastStatus(`Connected to Cast display: ${connection.id}`);
      } else {
        setCastStatus('In Chrome, click the 3 dots menu (⋮) > Save and share > Cast... to cast this tab.');
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setCastStatus('Cast selection cancelled.');
      } else {
        setCastStatus('Click Chrome menu (⋮) > Save and share > Cast... to stream to Chromecast or Smart TV.');
      }
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(lanTvUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestAudio = () => {
    playChime();
    setTimeout(() => {
      speakOrderReady('SF-2026-0001', 'Maria Santos');
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connect to Customer TV Display"
      subtitle="Cast or display live order pick-up status to TVs, monitors, or tablets"
      maxWidth="xl"
      footer={
        <div className="flex justify-end w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm"
          >
            Done
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Connection Method 1: Dual Monitor / HDMI Second Screen */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-600 transition-colors shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <MonitorPlay className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Method 1: HDMI / Dual Monitor Second Screen</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Recommended
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  If your PC or laptop is plugged into a TV via HDMI or wireless display, click below to open an isolated, borderless TV Kiosk window.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenWindow}
              className="py-2 px-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm transition-transform active:scale-95 shrink-0 ml-3"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Launch TV Window</span>
            </button>
          </div>
        </div>

        {/* Connection Method 2: Google Cast / Chromecast / AirPlay */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-600 transition-colors shadow-xs">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                <Cast className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Method 2: Google Cast / Chromecast / Smart TV
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Wirelessly beam the Customer Display to any Chromecast, Google TV, or smart display on the café Wi-Fi.
                </p>
                {castStatus && (
                  <p className="text-xs text-sky-800 font-bold bg-sky-50 p-2 rounded-lg mt-2">
                    {castStatus}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLaunchCast}
              className="py-2 px-3.5 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-sm transition-transform active:scale-95 shrink-0 ml-3"
            >
              <Cast className="w-3.5 h-3.5" />
              <span>Cast to TV</span>
            </button>
          </div>
        </div>

        {/* Connection Method 3: Smart TV Browser (Samsung Tizen, LG webOS, Android TV, Fire TV) */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Wifi className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900">
                Method 3: Smart TV Web Browser (WiFi / LAN)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Open the built-in browser on your Smart TV (Samsung, LG, Sony, Fire TV Stick) and visit this address on your local café Wi-Fi:
              </p>

              <div className="mt-2.5 flex items-center space-x-2">
                <div className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 select-all">
                  {lanTvUrl}
                </div>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="p-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center space-x-1 shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Audio Chime & Voice Callout Verification */}
        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-emerald-100 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-emerald-950">
                Automated TV Chime & Voice Callout
              </h5>
              <p className="text-[11px] text-emerald-800">
                Plays a pleasant airport/café chime and speaks order pickup callouts automatically.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestAudio}
            className="py-1.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg shadow-xs transition-colors shrink-0"
          >
            Test Sound & Voice
          </button>
        </div>
      </div>
    </Modal>
  );
};
