import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { X } from "lucide-react";

const AddClassModal = ({ isOpen, onClose, onSubmit, maxCapacity }) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useLayoutEffect(() => {
    if (!isOpen) return;

    // Animate only after refs exist
    gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, ease: "power2.out" });
    gsap.fromTo(
      modalRef.current,
      { y: 80, opacity: 0, scale: 0.92, rotateX: 10 },
      { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 0.55, ease: "back.out(1.7)" }
    );

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    onSubmit(data);
  };

  return (
    <div
      ref={overlayRef}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/40 backdrop-blur-md opacity-0 transition-opacity"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md p-8 rounded-2xl
                   bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl
                   shadow-[0_8px_40px_rgba(0,0,0,0.25)]
                   border border-gray-200/50 dark:border-gray-700/50
                   text-gray-900 dark:text-gray-100"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
          Add New Class
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
            <input
              id="title"
              name="title"
              required
              placeholder="Enter class title"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                         focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe the class..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                         focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 focus:outline-none"
            />
          </div>

          {/* Start Time */}
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium mb-1">Start Time</label>
            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                         focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 focus:outline-none"
            />
          </div>

          {/* Capacity */}
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium mb-1">
              Capacity (1 - {maxCapacity})
            </label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              max={maxCapacity}
              required
              placeholder="Enter class capacity"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700
                         focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 mt-4 rounded-lg font-semibold text-white
                       bg-gradient-to-r from-purple-600 to-cyan-500
                       hover:shadow-lg hover:-translate-y-0.5
                       transition-all duration-300"
          >
            Create Class
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddClassModal;
