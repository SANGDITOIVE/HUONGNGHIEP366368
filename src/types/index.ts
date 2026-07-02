// =============================================================
// Mô hình dữ liệu trung tâm (Phase 1). Mọi nội dung tách khỏi logic.
// =============================================================

// ---------- MBTI ----------
export type MBTIType =
	| "INTJ" | "INTP" | "ENTJ" | "ENTP"
	| "INFJ" | "INFP" | "ENFJ" | "ENFP"
	| "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ"
	| "ISTP" | "ISFP" | "ESTP" | "ESFP"

export type Temperament = "NT" | "NF" | "SJ" | "SP"

export interface MBTIProfile {
	type: MBTIType
	nickname: string
	temperament: Temperament
	temperamentLabel: string
	traits: string[]
	populationShare: string
	summary: string
	strengths: string[]
	watchOuts: string[]
}

// 20 nhóm rút gọn trong ma trận MBTI (nguồn: mbti_majors.csv)
export type MajorFitKey =
	| "luat-kinh-te" | "ky-thuat" | "cntt-ai" | "tai-chinh-ngan-hang"
	| "ke-toan-kiem-toan" | "kinh-doanh-quan-tri" | "marketing-truyen-thong"
	| "van-hoc-ngon-ngu" | "tam-ly-hoc" | "su-pham" | "y-duoc"
	| "dieu-duong" | "kien-truc" | "thiet-ke-do-hoa" | "du-lich-khach-san"
	| "nong-lam-thuy-san" | "xay-dung" | "hang-khong-hang-hai"
	| "moi-truong" | "vat-ly-toan-thong-ke"

export type MBTIFitMatrix = Record<MajorFitKey, Record<MBTIType, number>>

// ---------- Taxonomy đầu vào ----------
export type StreamId =
	| "khoi-a" | "khoi-a1" | "khoi-b" | "khoi-c" | "khoi-d"
	| "ban-khtn" | "ban-khxh" | "chua-ro"

export type SubjectId =
	| "toan" | "ly" | "hoa" | "sinh" | "van" | "su" | "dia"
	| "anh" | "tin" | "gdcd" | "my-thuat" | "am-nhac"

export type SkillId =
	| "tu-duy-logic" | "tinh-toan" | "giao-tiep" | "viet-lach"
	| "sang-tao" | "lanh-dao" | "lam-viec-nhom" | "ngoai-ngu"
	| "ky-thuat-tay-nghe" | "tin-hoc" | "phan-tich-du-lieu"
	| "thau-cam" | "to-chuc-ky-luat" | "thuyet-phuc"

export type InterestId =
	| "cong-nghe" | "kinh-doanh" | "nghe-thuat" | "con-nguoi"
	| "khoa-hoc" | "xa-hoi" | "suc-khoe" | "thien-nhien"
	| "ngon-ngu" | "phap-luat" | "thiet-ke" | "giao-duc"

export type WorkingStyleId =
	| "doc-lap" | "lam-nhom" | "co-cau-truc" | "linh-hoat"
	| "thuc-hanh" | "nghien-cuu"

export type EnvironmentId =
	| "van-phong" | "hien-truong" | "phong-lab" | "sang-tao"
	| "benh-vien" | "lop-hoc" | "ngoai-troi" | "so-hoa"

export type CareerDestinationId =
	| "doanh-nghiep" | "nha-nuoc" | "khoi-cong-nghe" | "y-te"
	| "giao-duc" | "sang-tao-nghe-thuat" | "phap-ly"
	| "khoi-nghiep" | "nghien-cuu" | "lam-viec-quoc-te"

// Giá trị nghề nghiệp người dùng coi trọng (dùng cho trục valueFit ở Phase 2).
export type ValueId =
	| "thu-nhap-cao" | "on-dinh" | "giup-do-nguoi-khac" | "sang-tao-tu-do"
	| "tu-chu-linh-hoat" | "thang-tien" | "duoc-ton-trong" | "thu-thach-tri-tue"
	| "can-bang-cuoc-song" | "tac-dong-xa-hoi"

// Mức hỗ trợ của gia đình
export type FamilySupportId =
	| "ho-tro-manh" | "ho-tro-trung-binh"
	| "can-can-nhac-chi-phi" | "can-di-lam-som"

// Nền tảng sẵn có của gia đình (ánh xạ về vùng kiến thức/ngành)
export type FamilyFieldId = KnowledgeAreaId | "khong-co"

// Người dùng có muốn đi theo định hướng/nền tảng của gia đình không
export type FollowFamilyId = "co" | "coi-mo" | "khong"

// Hình mẫu lý tưởng người dùng hướng tới
export type RoleModelId =
	| "nha-sang-lap" | "chuyen-gia-cong-nghe" | "bac-si" | "luat-su"
	| "nha-quan-ly" | "chuyen-gia-tai-chinh" | "nghe-si-sang-tao"
	| "nha-giao" | "nha-nghien-cuu" | "nha-truyen-thong"
	| "kien-truc-su" | "chua-ro"

// Vùng kiến thức người dùng mong muốn được học
export type KnowledgeAreaId =
	| "cong-nghe-may-tinh" | "kinh-te-kinh-doanh" | "suc-khoe-y-sinh"
	| "luat-xa-hoi" | "ky-thuat-xay-dung" | "nghe-thuat-thiet-ke"
	| "ngon-ngu-van-hoa" | "khoa-hoc-tu-nhien" | "giao-duc-su-pham"
	| "tam-ly-con-nguoi" | "moi-truong-nong-nghiep" | "truyen-thong-media"

// ---------- Ngành & trường ----------
export interface MajorField {
	id: string
	name: string
	icon: string
	shortDescription: string
	exampleMajors: string[]
	majorIds: string[]
	// Các chuyên ngành / hướng đào tạo đa dạng trong lĩnh vực.
	// Hiển thị khi người dùng bấm mở lĩnh vực ở trang Khám phá.
	specializations?: { name: string; description: string }[]
	// Nghề nghiệp đầu ra tiêu biểu khi học lĩnh vực này (mang tính tham khảo).
	careers?: string[]
	// Triển vọng việc làm định tính tại VN (tham khảo, không phải số liệu chính thức).
	outlook?: { level: OutlookLevel; note: string }
}

export type OutlookLevel = "cao" | "on-dinh" | "canh-tranh"

export interface Major {
	id: string
	name: string
	fieldId: string
	fitKey: MajorFitKey
	personalityConfidence: "high" | "low"
	definition: string
	nature: string
	whatYouStudy: string[]
	requiredSkills: SkillId[]
	futureDirection: string
	careers: string[]
	// Nơi làm việc phổ biến của người học ngành này (tham khảo).
	workplaces?: string[]
	suitableFor: string
	challenges: string[]
	opportunities: string[]
	relatedStreams: StreamId[]
	relatedSubjects: SubjectId[]
	relatedInterests: InterestId[]
	relatedRoleModels: RoleModelId[]
	knowledgeAreas: KnowledgeAreaId[]
	careerDestinations: CareerDestinationId[]
	feasibility: {
		durationYears: number
		relativeCost: "low" | "medium" | "high"
	}
	universityProgramIds: string[]
}

export interface University {
	id: string
	name: string
	shortName: string
	region: "bac" | "trung" | "nam"
	city: string
	type: "cong-lap" | "tu-thuc"
	website?: string
}

export interface UniversityProgram {
	id: string
	universityId: string
	majorId: string
	scores: {
		programReputation: number
		trainingStrength: number
		relevance: number
		recognitionBreadth: number
	}
	note?: string
}

// ---------- Hồ sơ đầu vào & kết quả ----------
export interface AssessmentInput {
	stream: StreamId | null
	favoriteSubjects: SubjectId[]
	skills: SkillId[]
	interests: InterestId[]
	workingStyles: WorkingStyleId[]
	preferredEnvironments: EnvironmentId[]
	careerDestinations: CareerDestinationId[]
	// Giá trị nghề nghiệp người dùng coi trọng
	values: ValueId[]
	// Gia đình / bối cảnh
	familySupport: FamilySupportId | null
	familyField: FamilyFieldId | null
	followFamily: FollowFamilyId | null
	// Định hướng cá nhân
	roleModels: RoleModelId[]
	knowledgeAreas: KnowledgeAreaId[]
	// Tính cách
	knowsMBTI: boolean
	mbtiType: MBTIType | null
	mbtiSource: "self" | "quiz" | "none"
}

export interface FactorBreakdown {
	familyFit: number
	interestFit: number
	skillFit: number
	roleModelFit: number
	knowledgeAreaFit: number
	personalityFit: number
	careerFit: number
	valueFit: number
	streamFit: number
}

export interface MajorRecommendation {
	major: Major
	score: number
	breakdown: FactorBreakdown
	weightedContributions: Record<keyof FactorBreakdown, number>
	reasons: string[]
	rankedUniversities: RankedUniversity[]
}

export interface RankedUniversity {
	university: University
	program: UniversityProgram
	internalScore: number
}

// ---------- Trắc nghiệm ----------
export type MBTIAxis = "EI" | "SN" | "TF" | "JP"

export interface QuizOption {
	label: string
	pole: "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P"
	// Trọng số cực: 2 = nghiêng rõ, 1 = nghiêng nhẹ.
	weight: number
}

export interface QuizQuestion {
	id: string
	axis: MBTIAxis
	prompt: string
	// Mỗi câu có >= 3 lựa chọn để sàng lọc tính cách rõ hơn.
	options: QuizOption[]
}
