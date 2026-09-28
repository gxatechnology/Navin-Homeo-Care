import React from 'react';
import { CLINIC_CONFIG } from '../config/clinicData';
import { Link } from '../context/RouterContext';
import { ShieldAlert, Lock, FileText, ArrowLeft, Phone, Stethoscope } from 'lucide-react';

export const MedicalDisclaimerPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 shadow-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Clinical Governance</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Medical Disclaimer &amp; Patient Safety</h1>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-600 space-y-5 leading-relaxed">
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 font-medium text-xs sm:text-sm">
            Emergency Notice: If you are experiencing a life-threatening medical emergency (such as severe chest pain, loss of consciousness, acute respiratory failure, heavy uncontrolled bleeding, or severe head trauma), immediately dial emergency emergency services (112 / 108 in India) or report to the nearest hospital trauma center.
          </div>

          <h2 className="text-lg font-bold text-slate-900 pt-2">1. Nature of Information</h2>
          <p>
            The content provided on this website—including condition overviews, articles, consultation guides, and FAQs—is intended for general educational and informational purposes only. It does not constitute formal diagnostic conclusions or definitive medical advice for any specific individual without an in-person clinical assessment by Dr. Navin Maurya.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">2. Individual Constitutional Response</h2>
          <p>
            Homeopathic therapy focuses on treating the patient as an individual entity rather than solely suppressing isolated diagnostic labels. Responses to remedies vary widely depending on personal constitution, chronicity of disease, underlying pathology, lifestyle choices, and hereditary tendencies.
          </p>
          <p className="font-semibold text-slate-900">
            Navin Homeo Care and Dr. Navin Maurya make NO claims of "guaranteed cures," "100% permanent relief," or instant outcomes. Ethical medicine acknowledges that therapeutic response is unique to each individual.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">3. Ongoing Conventional Medications</h2>
          <p>
            Patients must NEVER discontinue, adjust, or alter prescribed allopathic or conventional medicines (such as insulin, anti-hypertensives, cardiac medications, anti-epileptics, thyroid hormone replacements, or psychiatric drugs) without the explicit consent of their treating prescribing physician. Homeopathic consultation is designed to support patient wellness in harmony with necessary primary medical care.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">4. In-Clinic Evaluation Requirement</h2>
          <p>
            Submitting an online appointment request, enquiry form, or WhatsApp message does not establish a formal doctor-patient relationship until an individualized clinical history intake is conducted and documented by Dr. Maurya at the clinic.
          </p>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span>Last reviewed: September 2026 &bull; Navin Homeo Care</span>
            <a href={`tel:${CLINIC_CONFIG.phoneRaw}`} className="font-semibold text-blue-700 hover:underline">
              Contact Reception: {CLINIC_CONFIG.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 shadow-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Patient Data Safety</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-600 space-y-5 leading-relaxed">
          <p>
            At <span className="font-semibold text-slate-900">Navin Homeo Care</span>, we treat patient confidentiality with utmost clinical gravity. This Privacy Policy details how your personal contact details and health enquiry information are handled.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">1. Information We Collect</h2>
          <p>
            When you schedule an appointment or reach out through our online booking forms, we may collect:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Your full name, contact phone number, and optional email address</li>
            <li>Your preferred consultation date and time slot</li>
            <li>General category of your health inquiry or chief complaint</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 pt-2">2. How Your Information Is Used</h2>
          <p>
            The details you share are strictly utilized to:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Review appointment availability and coordinate consultation scheduling</li>
            <li>Send appointment confirmations, reminders, or clinic location directions</li>
            <li>Maintain confidential clinical case files in accordance with medical record standards</li>
          </ul>

          <h2 className="text-lg font-bold text-slate-900 pt-2">3. Non-Disclosure &amp; Zero Spam Commitment</h2>
          <p>
            We strictly NEVER sell, lease, trade, or distribute your personal or clinical details to third-party telemarketers, commercial advertisers, or unauthorized data brokers.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">4. Data Security</h2>
          <p>
            We maintain administrative and technical safeguards to ensure that patient information remains protected against unauthorized access, disclosure, or misuse.
          </p>

          <div className="pt-6 border-t border-slate-100 text-xs text-slate-500">
            For any queries regarding your patient records, please contact our clinic at <a href={`tel:${CLINIC_CONFIG.phoneRaw}`} className="text-blue-700 font-medium hover:underline">{CLINIC_CONFIG.phone}</a> or visit the clinic in Alambagh, Lucknow.
          </div>
        </div>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 shadow-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Clinic Policies</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Terms &amp; Conditions</h1>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-sm sm:text-base text-slate-600 space-y-5 leading-relaxed">
          <p>
            Welcome to the official web portal of <span className="font-semibold text-slate-900">Navin Homeo Care</span>. By browsing this website or scheduling an appointment through our portal, you acknowledge and agree to the terms outlined below.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">1. Consultation Scheduling</h2>
          <p>
            Online appointment requests submitted via this website are requests for clinic scheduling and are subject to doctor availability and confirmation by our front desk. In the event of emergency medical obligations or schedule adjustments, our staff will contact you to reschedule.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">2. Clinic Conduct &amp; OPD Ethics</h2>
          <p>
            We strive to provide a calm, respectful environment for all patients. Patients and accompanying attendants are requested to adhere to clinic hygiene standards, mobile silence etiquette in waiting areas, and respectful interaction with staff and fellow patients.
          </p>

          <h2 className="text-lg font-bold text-slate-900 pt-2">3. Intellectual Property</h2>
          <p>
            All clinic imagery, photography of the premises, logos, and medical editorial content published on this site belong to Navin Homeo Care and Dr. Navin Maurya. Unauthorized copying or redistribution is prohibited.
          </p>

          <div className="pt-6 border-t border-slate-100 text-xs text-slate-500">
            Clinic Address: Near Pakri Ka Pul (500 m), Azad Nagar Road, near Zoom Optical, Alambagh, Lucknow &bull; Phone: {CLINIC_CONFIG.phone}
          </div>
        </div>
      </div>
    </div>
  );
};
