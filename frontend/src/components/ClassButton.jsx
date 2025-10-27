// src/components/ClassButtons.jsx
import  Button  from "./ui/Button"; // or your custom button setup
import { useNavigate } from "react-router-dom";
import { Trash2, Edit3, PlayCircle, Bell, FileText } from "lucide-react";
import {deleteClass, updateClass, enterClass,} from "../api/api";
import PropTypes from "prop-types";

const ClassButtons = ({ classDetails, user , onClassDeleted, onClose }) => {
  const navigate = useNavigate();

  if (!classDetails || !user) return null;

  const isTeacher = user.role === "teacher";
  const isStudent = user.role === "student";
  const status = classDetails.status?.toLowerCase();

  const handleJoin = () => {
    console.log("Joining class:", classDetails._id);
    enterClass(classDetails._id);
    navigate(`/live/${classDetails._id}`);
  };

  const handleDelete = async () => {
  try {
    await deleteClass(classDetails._id);
    console.log("Deleted class:", classDetails._id);
    if (onClassDeleted) onClassDeleted(); // refresh parent data
    onClose(); // close modal
  } catch (err) {
    console.error("Delete failed:", err);
  }
};


  const handleUpdate = () => {
    const updatedData = { ...classDetails, title: "Updated Title" };
    console.log("Preparing to update class:", updatedData);
    if (updatedData) {

      console.log("Updating class:", classDetails._id);
      updateClass(classDetails._id, updatedData);
    }
  };

  const handleReminder = () => {
    console.log("Reminder set for:", classDetails._id);
  };

  const handleNotes = () => {
    navigate(`/class/${classDetails._id}/notes`);
  };

  const renderButtons = () => {
    if (status === "upcoming") {
      if (isTeacher)
        return (
          <>
            <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Edit3 size={16} className="mr-2" /> Update
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              <Trash2 size={16} className="mr-2" /> Delete
            </Button>
          </>
        );
      if (isStudent)
        return (
          <Button onClick={handleReminder} className="bg-amber-500 hover:bg-amber-600 text-white">
            <Bell size={16} className="mr-2" /> Set Reminder
          </Button>
        );
    }

    if (status === "started") {
      if (isTeacher)
        return (
          <>
            <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Edit3 size={16} className="mr-2" /> Update
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              <Trash2 size={16} className="mr-2" /> Delete
            </Button>
            <Button onClick={handleJoin} className="bg-green-600 hover:bg-green-700 text-white">
              <PlayCircle size={16} className="mr-2" /> Join Class
            </Button>
          </>
        );
      if (isStudent)
        return (
          <Button onClick={handleJoin} className="bg-green-600 hover:bg-green-700 text-white">
            <PlayCircle size={16} className="mr-2" /> Join Class
          </Button>
        );
    }

    if (status === "ended") {
      if (isTeacher)
        return (
          <>
            <Button onClick={handleNotes} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <FileText size={16} className="mr-2" /> Notes
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              <Trash2 size={16} className="mr-2" /> Delete
            </Button>
          </>
        );
      if (isStudent)
        return (
          <Button onClick={handleNotes} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <FileText size={16} className="mr-2" /> Notes
          </Button>
        );
    }

    return null;
  };

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-6">{renderButtons()}</div>
  );
};

ClassButtons.propTypes = {
  classDetails: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
};

export default ClassButtons;
