"use client"
import React, { useState } from 'react';
import Image from 'next/image'
import { Button } from "@/components/ui/button"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from '@/components/ui/card';
export default function Stories() {

  const slides = [
    {
      id: 1,
      image: '/story1.jpg', 
      title: 'Remember that kitty you found ?',
      text: 'Remember that one time you found a kitten down the street and you helped her find shelter and food ..even thought you were running late you prioritized helping the little kitty find her way ! what a hero thong to do ! we are so proud of you'
    },
 
    {
      id: 2,
      image: '/story3.jpg',
      title: 'Going out of your comfort zone',
      text: 'I know you are used to studying with your friends ! sucks you wont be able to always be with them ...still that one time you decided to try something new ! Study at a coffee shop alone ! Despite being intimidated by that you still managed to try something new ! it was fun wasnt it ? '
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = async() => {
    try {
      const response = await fetch('http://localhost:8001/gen_image', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
    
      console.log("Received from backend:", data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };
  return (
    <main className="flex flex-col h-screen bg-gradient-to-b from-rose-50 to-blue-50 p-4 pb-20">
    {/* Title */}
    <div className="flex items-center mb-4">
      <Link href="/">
        <Button variant="ghost" size="icon" className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>
      <h1 className="text-xl font-semibold text-rose-600">Your Stories</h1>
    </div>
   
      <Card className="mb-6 border-none shadow-md bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <h2 className="text-xl font-medium text-center text-slate-700 mb-2">Moments you shined!</h2>
          <p className="text-slate-600 text-center mb-4">
          Do you remember those stories ? they are memories from the past we talked about ...They are moments your kindness and braveness shined !
          </p>
        </CardContent>
      </Card>
    {/* Navigators */}
    <button 
      onClick={prevSlide}
      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/50 rounded-full p-2"
    >
      &lt;
    </button>
    <button 
      onClick={nextSlide}
      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/50 rounded-full p-2"
    >
      &gt;
    </button>
  
    {/* Main Slide Content */}
    <div className="flex justify-center">
      <div className="flex flex-col md:flex-row items-center justify-between bg-white/70 backdrop-blur-md rounded-xl shadow-md p-4 md:p-6 w-full md:w-4/5 max-w-5xl">
        
        {/* Image */}
        <div className="mb-4 md:mb-0 md:mr-6">
        {isHovered && (
            <div className="absolute top-1/2 left-full ml-3 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-1 rounded shadow-lg z-10">
          <p>Wanna see your story as art?</p>
        </div>
      )}
          <Image
            src={slides[currentSlide].image}
            alt="Picture vibes"
            width={500}
            height={500}
            className="rounded-lg max-w-full h-auto"
            onMouseEnter={() => setIsHovered(true)}  // Show message on hover
            onMouseLeave={() => setIsHovered(false)} // Hide message when hover ends
            onClick={handleClick}  // Trigger alert on click
          />
        </div>
   
        {/* Text Container */}
        <div className="w-full md:flex-1 p-2 md:p-4">
          <h2 className="text-2xl font-bold mb-2">{slides[currentSlide].title}</h2>
          <p className="text-gray-700">{slides[currentSlide].text}</p>
  
          {/* Dots Indicator */}
          <div className="flex justify-center md:justify-start mt-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 mx-1 rounded-full ${index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </main>
  
  
  );
}


