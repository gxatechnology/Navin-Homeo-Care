import React from 'react';
import {
  Sparkles,
  Wind,
  Activity,
  Zap,
  Heart,
  Smile,
  Stethoscope,
  Shield,
  LucideIcon,
} from 'lucide-react';

export interface ConditionMediaConfig {
  slug: string;
  title: string;
  imageUrl: string;
  altText: string;
  fallbackIcon: LucideIcon;
  badgeLabel: string;
  containerBg: string;
  borderColor: string;
}

export const CONDITION_MEDIA_MAP: Record<string, ConditionMediaConfig> = {
  'skin-and-hair': {
    slug: 'skin-and-hair',
    title: 'Skin & Hair Problems',
    imageUrl: '/images/conditions/skin-and-hair.svg',
    altText: 'Medical illustration representing skin dermis care and healthy hair follicle health',
    fallbackIcon: Sparkles,
    badgeLabel: 'Skin & Scalp Care',
    containerBg: 'from-emerald-50/90 to-teal-50/50',
    borderColor: 'border-emerald-200/70',
  },
  'allergy-and-respiratory': {
    slug: 'allergy-and-respiratory',
    title: 'Allergy & Breathing Concerns',
    imageUrl: '/images/conditions/allergy-and-respiratory.svg',
    altText: 'Medical illustration of healthy respiratory lungs, airways and sinus breathing comfort',
    fallbackIcon: Wind,
    badgeLabel: 'Respiratory Care',
    containerBg: 'from-sky-50/90 to-emerald-50/50',
    borderColor: 'border-sky-200/70',
  },
  'digestive-health': {
    slug: 'digestive-health',
    title: 'Digestive Problems',
    imageUrl: '/images/conditions/digestive-health.svg',
    altText: 'Medical illustration of gastric stomach health and digestive system harmony',
    fallbackIcon: Activity,
    badgeLabel: 'Digestive Wellness',
    containerBg: 'from-amber-50/90 to-emerald-50/50',
    borderColor: 'border-amber-200/70',
  },
  'joint-and-musculoskeletal': {
    slug: 'joint-and-musculoskeletal',
    title: 'Joint & Back Pain',
    imageUrl: '/images/conditions/joint-and-musculoskeletal.svg',
    altText: 'Medical illustration of spinal vertebrae column, joints and pain-relief alignment',
    fallbackIcon: Zap,
    badgeLabel: 'Joint & Spine Care',
    containerBg: 'from-blue-50/90 to-emerald-50/50',
    borderColor: 'border-blue-200/70',
  },
  'womens-health': {
    slug: 'womens-health',
    title: "Women’s Health",
    imageUrl: '/images/conditions/womens-health.svg',
    altText: 'Medical illustration of women hormonal balance and female wellness care',
    fallbackIcon: Heart,
    badgeLabel: "Women's Wellness",
    containerBg: 'from-rose-50/90 to-emerald-50/50',
    borderColor: 'border-rose-200/70',
  },
  'child-health': {
    slug: 'child-health',
    title: 'Child Health',
    imageUrl: '/images/conditions/child-health.svg',
    altText: 'Medical illustration of pediatric care and gentle child immunity wellness',
    fallbackIcon: Smile,
    badgeLabel: 'Pediatric Care',
    containerBg: 'from-emerald-50/90 to-sky-50/50',
    borderColor: 'border-emerald-200/70',
  },
  'chronic-health': {
    slug: 'chronic-health',
    title: 'Chronic Health Problems',
    imageUrl: '/images/conditions/chronic-health.svg',
    altText: 'Medical illustration of constitutional health rhythm, stamina and whole-body vitality',
    fallbackIcon: Stethoscope,
    badgeLabel: 'Constitutional Care',
    containerBg: 'from-emerald-50/90 to-blue-50/50',
    borderColor: 'border-emerald-200/70',
  },
  'general-consultation': {
    slug: 'general-consultation',
    title: 'General Health Consultation',
    imageUrl: '/images/conditions/general-consultation.svg',
    altText: 'Medical illustration of physician clinical assessment and holistic diagnosis shield',
    fallbackIcon: Shield,
    badgeLabel: 'Clinical Consultation',
    containerBg: 'from-blue-50/90 to-emerald-50/50',
    borderColor: 'border-blue-200/70',
  },
};

export const getConditionMedia = (slug: string): ConditionMediaConfig => {
  return (
    CONDITION_MEDIA_MAP[slug] || {
      slug,
      title: 'Health Consultation',
      imageUrl: '/images/conditions/general-consultation.svg',
      altText: 'Medical illustration for health consultation',
      fallbackIcon: Shield,
      badgeLabel: 'Care Consultation',
      containerBg: 'from-emerald-50/90 to-slate-50',
      borderColor: 'border-emerald-200/70',
    }
  );
};
