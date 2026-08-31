import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  Camera, 
  Scan, 
  X, 
  Flashlight, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  PlusCircle, 
  Search, 
  PackageCheck, 
  Layers,
  ArrowRight,
  Barcode,
  Keyboard
} from 'lucide-react';
import { PharmaCatalogDrug } from '../types/pharmayemen';
import { 
  resolveMedicineBarcode, 
  playBarcodeBeepSound, 
  ScannedMedicineResult,
  MASTER_PHARMA_BARCODES 
} from '../utils/pharmaBarcode';

interface PharmaBarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: PharmaCatalogDrug[];
  onSelectForOffer: (drug: PharmaCatalogDrug, scannedDetails?: Partial<ScannedMedicineResult>) => void;
  onSelectForRequest: (drug: PharmaCatalogDrug, scannedDetails?: Partial<ScannedMedicineResult>) => void;
  onSearchInCatalog?: (searchTerm: string) => void;
}

export const PharmaBarcodeScannerModal: React.FC<PharmaBarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  catalog,
  onSelectForOffer,
  onSelectForRequest,
  onSearchInCatalog,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<ScannedMedicineResult | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'pharma-barcode-scanner-region';

  // Handle successful scan
  const handleBarcodeDetected = (decodedText: string) => {
    playBarcodeBeepSound();
    const result = resolveMedicineBarcode(decodedText, catalog);
    setScannedResult(result);
  };

  // Start Camera Scanner
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {
          // ignore
        }
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ],
        verbose: false,
      });

      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 280, height: 180 },
        aspectRatio: 1.333333,
      };

      await html5QrCode.start(
        { facingMode: facingMode },
        config,
        (decodedText) => {
          handleBarcodeDetected(decodedText);
        },
        () => {
          // Frame scan error/waiting - normal frame ignore
        }
      );

      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start issue:', err);
      setIsCameraActive(false);
      setCameraError(
        'تعذر الوصول إلى الكاميرا مباشرة. يرجى التأكد من منح الإذن للمتصفح، أو يمكنك إدخال الباركود يدوياً أو اختيار أحد أصناف المحاكاة.'
      );
    }
  };

  // Stop Camera
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (e) {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Toggle Torch/Flash
  const toggleTorch = async () => {
    if (!html5QrCodeRef.current || !isCameraActive) return;
    try {
      const newTorch = !torchOn;
      await html5QrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: newTorch } as any],
      });
      setTorchOn(newTorch);
    } catch (e) {
      console.log('Torch not supported on this device/camera');
    }
  };

  // Switch between back and front camera
  const switchCameraFacing = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive) {
      await stopCamera();
      setTimeout(() => {
        startCamera();
      }, 200);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setScannedResult(null);
      // Try launching camera on modal open
      const timer = setTimeout(() => {
        startCamera();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleBarcodeDetected(manualCode.trim());
    setManualCode('');
  };

  const handleSimulateBarcode = (barcodeVal: string) => {
    handleBarcodeDetected(barcodeVal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>ماسح الباركود الدوائي بالكاميرا</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  EAN-13 & GS1 2D
                </span>
              </h3>
              <p className="text-xs text-slate-400">وجه الكاميرا نحو باركود علبة أو شريط الدواء للإضافة الفورية</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* CAMERA VIEWFINDER CONTAINER */}
          <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-700 aspect-video sm:aspect-4/3 flex items-center justify-center">
            
            {/* Real Html5Qrcode video node */}
            <div 
              id={scannerContainerId} 
              className="w-full h-full overflow-hidden [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
            />

            {/* Target Reticle / Scanner Overlay */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Dark Vignette outside target */}
                <div className="relative w-64 sm:w-72 h-40 sm:h-48 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] flex flex-col justify-between p-2">
                  
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                  {/* Red / Emerald Laser Sweep Animation */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce" />

                  <div className="text-center">
                    <span className="text-[11px] font-bold text-emerald-300 bg-slate-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      ضع رمز الباركود داخل الإطار
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Camera Fallback / Inactive State */}
            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 space-y-3 z-10">
                <div className="p-3 rounded-2xl bg-slate-800 text-slate-400">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-bold text-white">الكاميرا في وضع الاستعداد</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {cameraError || 'اضغط على زر تشغيل الكاميرا لبدء القراءة اللحظية للباركود'}
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>تشغيل كاميرا الجهاز</span>
                </button>
              </div>
            )}

            {/* Floating Camera Controls (Flash, Switch Camera, Stop) */}
            {isCameraActive && (
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-auto">
                <button
                  onClick={toggleTorch}
                  className={`p-2.5 rounded-xl border backdrop-blur-md transition ${
                    torchOn 
                      ? 'bg-amber-500 text-slate-950 border-amber-300' 
                      : 'bg-slate-900/80 text-white border-slate-700 hover:bg-slate-800'
                  }`}
                  title="تشغيل / إيقاف الفلاش (Flashlight)"
                >
                  <Flashlight className="w-4 h-4" />
                </button>

                <div className="text-[10px] bg-slate-900/90 text-slate-300 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>الكاميرا تعمل بنشاط</span>
                </div>

                <button
                  onClick={switchCameraFacing}
                  className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 backdrop-blur-md transition"
                  title="تبديل الكاميرا (الأمامية / الخلفية)"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* DETECTED MEDICINE RESULT CARD */}
          {scannedResult && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border-2 border-emerald-500/60 shadow-xl space-y-3 animate-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 tracking-wide uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      تم التعرف على الدواء بنجاح (تطابق {scannedResult.confidence}%)
                    </span>
                    <h3 className="text-base font-black text-white mt-1">
                      {scannedResult.genericName}
                    </h3>
                    {scannedResult.brandName && (
                      <p className="text-xs font-semibold text-emerald-300">
                        {scannedResult.brandName}
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-xs font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                  {scannedResult.barcode}
                </span>
              </div>

              {/* Drug Attributes Pill Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                {scannedResult.dosageForm && (
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-slate-300">
                    <span className="text-[10px] text-slate-500 block">الشكل الصيدلاني:</span>
                    <span className="font-semibold">{scannedResult.dosageForm}</span>
                  </div>
                )}
                {scannedResult.strength && (
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-slate-300">
                    <span className="text-[10px] text-slate-500 block">التركيز:</span>
                    <span className="font-semibold text-emerald-400">{scannedResult.strength}</span>
                  </div>
                )}
                {scannedResult.expiryDate && (
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800 text-slate-300">
                    <span className="text-[10px] text-slate-500 block">الصلاحية المستخرجة:</span>
                    <span className="font-semibold text-amber-400">{scannedResult.expiryDate}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons for Scanned Drug */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const drugTarget = scannedResult.drug || {
                      id: `scanned-${Date.now()}`,
                      genericName: scannedResult.genericName,
                      category: 'عام',
                      dosageForm: scannedResult.dosageForm || 'أقراص/كبسولات',
                      strength: scannedResult.strength || '',
                    };
                    onSelectForOffer(drugTarget as PharmaCatalogDrug, scannedResult);
                    stopCamera();
                    onClose();
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>طرح كعرض دواء فائض (Offer)</span>
                </button>

                <button
                  onClick={() => {
                    const drugTarget = scannedResult.drug || {
                      id: `scanned-${Date.now()}`,
                      genericName: scannedResult.genericName,
                      category: 'عام',
                      dosageForm: scannedResult.dosageForm || 'أقراص/كبسولات',
                      strength: scannedResult.strength || '',
                    };
                    onSelectForRequest(drugTarget as PharmaCatalogDrug, scannedResult);
                    stopCamera();
                    onClose();
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>تسجيل كطلب احتياج وشح (Request)</span>
                </button>
              </div>

              {/* Quick Scan Next Button */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  onClick={() => setScannedResult(null)}
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>مسح باركود دواء آخر</span>
                </button>
                {onSearchInCatalog && (
                  <button
                    onClick={() => {
                      onSearchInCatalog(scannedResult.genericName);
                      stopCamera();
                      onClose();
                    }}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition"
                  >
                    <span>فتح في الدليل الوطني (NEML)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MANUAL BARCODE INPUT & QUICK EMULATOR */}
          <div className="space-y-3 pt-1 border-t border-slate-800">
            
            {/* Manual entry field */}
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="أو أدخل رقم الباركود / قارئ الـ USB يدوياً (مثال: 6291040001015)..."
                  className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700"
              >
                فحص الرمز
              </button>
            </form>

            {/* Quick Demo Barcodes for instant testing without boxes */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>أصناف سريعة لتجربة الماسح الفوري (Quick Test Barcodes):</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(MASTER_PHARMA_BARCODES).slice(0, 6).map(([code, item]) => (
                  <button
                    key={code}
                    onClick={() => handleSimulateBarcode(code)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-900/60 hover:border-emerald-500/50 border border-slate-700 text-[11px] text-slate-300 hover:text-white transition flex items-center gap-1.5"
                    title={`رمز: ${code}`}
                  >
                    <Barcode className="w-3 h-3 text-emerald-400" />
                    <span>{item.brandName.split(' ')[0]}</span>
                    <span className="text-[9px] text-slate-400 font-mono">({code.slice(-4)})</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>متوافق مع معايير GS1 الدولية والباركود الثنائي DataMatrix</span>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
