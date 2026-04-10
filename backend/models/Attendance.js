const mongoose = require("mongoose");

const AttendanceRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  status: { type: String, enum: ["present", "absent", "late"], required: true },
  subject: { type: String, required: true, trim: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  remarks: { type: String, trim: true, default: "" },
});

const AttendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true, trim: true },
    semester: { type: String, required: true },
    records: [AttendanceRecordSchema],
    totalClasses: { type: Number, default: 0 },
    classesAttended: { type: Number, default: 0 },
    attendancePercentage: { type: Number, default: 0, min: 0, max: 100 },
    isBelowThreshold: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AttendanceSchema.methods.calculateAttendance = function () {
  const total = this.records.length;
  this.totalClasses = total;
  if (total === 0) {
    this.classesAttended = 0;
    this.attendancePercentage = 0;
    this.isBelowThreshold = false;
    return;
  }
  const attended = this.records.reduce((sum, record) => {
    if (record.status === "present") return sum + 1;
    if (record.status === "late") return sum + 0.5;
    return sum;
  }, 0);
  this.classesAttended = attended;
  const percentage = (attended / total) * 100;
  this.attendancePercentage = Math.round(percentage * 100) / 100;
  this.isBelowThreshold = this.attendancePercentage < 75;
};

AttendanceSchema.pre("save", function (next) {
  this.calculateAttendance();
  next();
});

AttendanceSchema.statics.getStudentSummary = async function (studentId) {
  const records = await this.find({ studentId }).lean();
  const totalAll = records.reduce((sum, r) => sum + r.totalClasses, 0);
  const attendedAll = records.reduce((sum, r) => sum + r.classesAttended, 0);
  const overallPercentage = totalAll > 0 ? Math.round((attendedAll / totalAll) * 10000) / 100 : 0;
  return {
    studentId,
    overallPercentage,
    totalClasses: totalAll,
    classesAttended: attendedAll,
    isOverallBelowThreshold: overallPercentage < 75,
    subjects: records.map((r) => ({
      subject: r.subject,
      semester: r.semester,
      totalClasses: r.totalClasses,
      classesAttended: r.classesAttended,
      attendancePercentage: r.attendancePercentage,
      isBelowThreshold: r.isBelowThreshold,
      classesNeededFor75: Math.max(0, Math.ceil((0.75 * r.totalClasses - r.classesAttended) / 0.25)),
    })),
  };
};

module.exports = mongoose.model("Attendance", AttendanceSchema);