// Bài viết cẩm nang hướng nghiệp - nội dung tĩnh, tiếng Việt.
// Giữ giọng văn thực tế, không tô hồng, không hứa hẹn chắc chắn.

export interface ArticleSection {
	heading: string
	paragraphs: string[]
}

export interface ArticleSource {
	label: string
	publisher: string
	url: string
	year?: string
}

export interface Article {
	slug: string
	title: string
	description: string
	category: string
	readingMinutes: number
	updated: string
	sections: ArticleSection[]
	// Nguồn tham khảo thật, có trích dẫn (hiển thị ở cuối bài).
	sources?: ArticleSource[]
}

export const ARTICLES: Article[] = [
	{
		slug: "chua-biet-thich-gi",
		title: "Chưa biết mình thích gì thì chọn ngành thế nào?",
		description: "Một số cách thực tế để bắt đầu khi bạn chưa rõ sở thích hay thế mạnh của mình.",
		category: "Định hướng",
		readingMinutes: 5,
		updated: "2025-01-01",
		sections: [
			{
				heading: "Bắt đầu bằng việc loại trừ",
				paragraphs: [
					"Không biết thích gì là điều rất bình thường ở tuổi 17 - 18. Thay vì cố tìm ngay đam mê lớn, hãy bắt đầu bằng việc loại bớt: những môn nào bạn thấy mệt mỏi, những công việc nào bạn chắc chắn không muốn làm.",
				"Khi danh sách thu hẹp lại, lựa chọn sẽ bớt rối và bạn dễ tập trung tìm hiểu sâu hơn vào số ít còn lại.",
			],
			},
			{
				heading: "Quan sát điều bạn làm một cách tự nhiên",
				paragraphs: [
					"Đam mê thường ẩn trong những việc bạn làm mà không thấy chán: hay giúp bạn bè giảng bài, thích sửa đồ, mê sắp xếp sự kiện, hay vẽ vời. Đó là manh mối về thế mạnh.",
				"Hãy thử ghi lại trong một tuần những lúc bạn thấy hứng thú nhất. Mẫu số chung của chúng nói lên nhiều điều.",
			],
			},
			{
				heading: "Chọn hướng đủ rộng, đừng ép mình quá sớm",
				paragraphs: [
					"Nếu vẫn phân vân, hãy chọn một lĩnh vực đủ rộng để còn rẽ nhánh sau này, thay vì một ngành quá hẹp. Nhiều người tìm ra hướng đi rõ ràng trong quá trình học chứ không phải trước khi học.",
				"Công cụ đánh giá và bản đồ môn học trên trang này là điểm khởi đầu để khám phá, không phải lời phán quyết cuối cùng.",
			],
			},
		],
	},
	{
		slug: "khoi-thi-to-hop",
		title: "Hiểu đúng về khối thi và tổ hợp xét tuyển",
		description: "Khối thi, tổ hợp môn và cách chọn sao cho mở rộng cơ hội xét tuyển.",
		category: "Tuyển sinh",
		readingMinutes: 4,
		updated: "2025-01-01",
		sections: [
			{
				heading: "Khối thi và tổ hợp là gì?",
				paragraphs: [
					"Tổ hợp xét tuyển là nhóm các môn được dùng để tính điểm vào một ngành. Ví dụ khối A gồm Toán - Lý - Hóa, khối D gồm Toán - Văn - Anh.",
				"Mỗi trường và mỗi ngành có thể nhận nhiều tổ hợp khác nhau, nên bạn cần xem kỹ đề án tuyển sinh của từng trường.",
			],
			},
			{
				heading: "Một ngành thường có nhiều tổ hợp",
				paragraphs: [
					"Đừng nghĩ một ngành chỉ xét một khối. Nhiều ngành nhận 3 - 4 tổ hợp, nghĩa là bạn có thể tận dụng tổ hợp mạnh nhất của mình để tăng cơ hội.",
				"Hãy chọn tổ hợp dựa trên môn bạn thực sự làm tốt, không chỉ dựa trên thói quen của lớp hay bạn bè.",
			],
			},
			{
				heading: "Lời khuyên khi chọn tổ hợp",
				paragraphs: [
					"Ưu tiên tổ hợp giúp bạn vừa đạt điểm cao vừa mở ra nhiều ngành phù hợp. Luôn kiểm tra thông tin chính thức từ trang tuyển sinh của trường, vì quy định có thể thay đổi theo năm.",
			],
			},
		],
		sources: [
			{
				label: "Ban hành Quy chế tuyển sinh đại học",
				publisher: "Bộ Giáo dục và Đào tạo (MOET)",
				url: "https://moet.gov.vn/tin-tuc/tin-tong-hop2/ban-hanh-quy-che-tuyen-sinh-dai-hoc-nam-2026.html",
				year: "2025",
			},
		],
	},
	{
		slug: "mbti-huong-nghiep",
		title: "MBTI trong hướng nghiệp: dùng sao cho đúng?",
		description: "MBTI có thể gợi ý hữu ích nếu bạn hiểu giới hạn của nó.",
		category: "Tính cách",
		readingMinutes: 5,
		updated: "2025-01-01",
		sections: [
			{
				heading: "MBTI là một gợi ý, không phải nhãn cố định",
				paragraphs: [
					"MBTI mô tả xu hướng bạn nạp năng lượng, tiếp nhận thông tin và ra quyết định. Nó hữu ích để bạn hiểu bản thân hơn, nhưng không đo được năng lực hay quyết định bạn hợp nghề gì.",
				"Kết quả MBTI có thể thay đổi theo thời gian và tâm trạng, nên đừng coi nó là sự thật tuyệt đối.",
			],
			},
			{
				heading: "Dùng MBTI để hiểu cách mình làm việc",
				paragraphs: [
					"Thay vì hỏi 'kiểu của tôi nên làm nghề gì', hãy hỏi 'tôi làm việc thoải mái nhất trong môi trường thế nào'. Ví dụ người hướng nội có thể vẫn làm tốt nghề giao tiếp nếu được chuẩn bị kỹ.",
			],
			},
			{
				heading: "Đừng để MBTI giới hạn bạn",
				paragraphs: [
					"Có vô số người thành công trong những nghề 'không hợp kiểu tính cách' của họ. MBTI nên là một mảnh ghép, đặt cạnh sở thích, kỹ năng và hoàn cảnh, chứ không phải tiêu chí duy nhất.",
			],
			},
		],
	},
	{
		slug: "khac-y-gia-dinh",
		title: "Khi định hướng của bạn khác với mong muốn của gia đình",
		description: "Cách đối thoại với bố mẹ khi hai bên chưa cùng quan điểm về chọn ngành.",
		category: "Gia đình",
		readingMinutes: 6,
		updated: "2025-01-01",
		sections: [
			{
				heading: "Hiểu lý do đằng sau mong muốn của bố mẹ",
				paragraphs: [
					"Phần lớn bố mẹ định hướng con vì lo cho sự ổn định và an toàn, dựa trên kinh nghiệm của họ. Hiểu được nỗi lo đó giúp cuộc trò chuyện bớt căng thẳng.",
				"Khi bạn cho thấy mình đã suy nghĩ nghiêm túc, bố mẹ thường sẵn sàng lắng nghe hơn.",
			],
			},
			{
				heading: "Chuẩn bị lập luận bằng thông tin",
				paragraphs: [
					"Thay vì chỉ nói 'con thích', hãy trình bày: ngành học gì, ra trường làm gì, cơ hội và thách thức ra sao. Thông tin cụ thể thuyết phục hơn cảm xúc.",
				"Bạn có thể dùng phần Khám phá ngành trên trang này để dẫn chứng về nghề nghiệp và triển vọng.",
			],
			},
			{
				heading: "Tìm điểm giao thoa",
				paragraphs: [
					"Nhiều khi có hướng đi dung hoà được cả mong muốn của bạn lẫn kỳ vọng của gia đình. Hãy tìm ngành hoặc lộ trình thoả mãn phần lớn cả hai bên, thay vì xem đây là cuộc thắng - thua.",
			],
			},
		],
	},
	{
		slug: "ky-nang-tuong-lai",
		title: "Nghề nghiệp tương lai: kỹ năng nào sẽ quan trọng?",
		description: "Những nhóm kỹ năng có giá trị lâu dài dù ngành nghề thay đổi.",
		category: "Xu hướng",
		readingMinutes: 5,
		updated: "2025-01-01",
		sections: [
			{
				heading: "Kỹ năng nền tảng ít lỗi thời",
				paragraphs: [
					"Tư duy phản biện, giao tiếp, làm việc nhóm và giải quyết vấn đề là những kỹ năng có giá trị ở hầu hết ngành nghề và khó bị thay thế.",
				"Đầu tư vào chúng từ sớm thường mang lại lợi ích lâu dài hơn là chạy theo một công cụ cụ thể.",
				"Báo cáo Future of Jobs 2025 của Diễn đàn Kinh tế Thế giới (WEF) cũng cho rằng khoảng 39% kỹ năng cốt lõi sẽ thay đổi đến năm 2030, với tư duy phân tích, khả năng thích ứng và học hỏi liên tục nằm trong nhóm quan trọng nhất.",
			],
			},
			{
				heading: "Khả năng tự học liên tục",
				paragraphs: [
					"Công việc thay đổi nhanh, nên biết cách tự học một kỹ năng mới có khi quan trọng hơn kiến thức bạn có hôm nay. Hãy luyện thói quen học đều đặn.",
			],
			},
			{
				heading: "Kết hợp chuyên môn với công nghệ",
				paragraphs: [
					"Dù theo ngành nào, biết tận dụng công cụ số và dữ liệu sẽ giúp bạn nổi bật. Bạn không cần thành chuyên gia công nghệ, chỉ cần đủ thoải mái để dùng chúng phục vụ công việc của mình.",
			],
			},
		],
		sources: [
			{
				label: "Future of Jobs Report 2025 (phần Skills outlook)",
				publisher: "World Economic Forum (WEF)",
				url: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
				year: "2025",
			},
		],
	},
	{
		slug: "thi-truong-lao-dong-vn",
		title: "Thị trường lao động Việt Nam: vài con số nên biết",
		description: "Một số số liệu chính thức về việc làm, thu nhập và đào tạo để bạn nhìn bức tranh thực tế hơn.",
		category: "Xu hướng",
		readingMinutes: 5,
		updated: "2025-02-01",
		sections: [
			{
				heading: "Thất nghiệp và lao động trẻ",
				paragraphs: [
					"Theo Tổng cục Thống kê, tỷ lệ thất nghiệp trong độ tuổi lao động năm 2024 là 2,24%, gần như đi ngang so với các năm trước. Con số này cho thấy thị trường lao động nói chung khá ổn định.",
					"Tuy nhiên, tỷ lệ thất nghiệp của thanh niên 15-24 tuổi cao hơn nhiều, ở mức 7,83% trong năm 2024. Giai đoạn đầu sự nghiệp thường khó khăn hơn, nên việc chuẩn bị kỹ năng và kinh nghiệm từ sớm là quan trọng.",
				],
			},
			{
				heading: "Thu nhập và bằng cấp",
				paragraphs: [
					"Cũng theo Tổng cục Thống kê, thu nhập bình quân của lao động năm 2024 khoảng 7,7 triệu đồng/tháng. Đây là mức trung bình chung; thu nhập thực tế khác nhau nhiều theo ngành, vùng và kinh nghiệm.",
					"Tỷ lệ lao động đã qua đào tạo có bằng, chứng chỉ ước đạt khoảng 28,3% trong năm 2024. Bằng cấp không đảm bảo việc làm, nhưng được đào tạo bài bản vẫn là một lợi thế đáng kể.",
				],
			},
			{
				heading: "Đọc số liệu sao cho đúng",
				paragraphs: [
					"Số liệu vĩ mô mô tả xu hướng chung, không dự đoán riêng cho từng người. Đừng chọn ngành chỉ vì một con số 'nóng', cũng đừng tránh ngành chỉ vì một con số 'xấu'.",
					"Hãy xem số liệu như bối cảnh tham khảo, kết hợp với sở thích, năng lực và hoàn cảnh của bạn. Các số liệu trên được trích từ nguồn chính thức ghi ở cuối bài.",
				],
			},
		],
		sources: [
			{
				label: "Thông cáo báo chí về tình hình lao động, việc làm quý IV và năm 2024",
				publisher: "Tổng cục Thống kê (GSO)",
				url: "https://www.nso.gov.vn/du-lieu-va-so-lieu-thong-ke/2025/01/thong-cao-bao-chi-ve-tinh-hinh-lao-dong-viec-lam-quy-iv-va-nam-2024/",
				year: "2025",
			},
		],
	},
	{
		slug: "lam-trai-nganh",
		title: "Làm trái ngành có phải là thất bại?",
		description: "Trái ngành phổ biến hơn nhiều người tưởng. Hiểu đúng con số để bớt lo và chọn ngành tỉnh táo hơn.",
		category: "Định hướng",
		readingMinutes: 6,
		updated: "2025-02-01",
		sections: [
			{
				heading: "Trái ngành phổ biến hơn bạn nghĩ",
				paragraphs: [
					"Một khảo sát của nhóm nghiên cứu thuộc Trường Quốc tế (Đại học Quốc gia Hà Nội) công bố năm 2024 cho thấy: tính trung bình, khoảng 21,43% sinh viên tốt nghiệp làm trái ngành. Con số này không nhỏ, và ở một số nhóm ngành còn cao hơn nhiều.",
					"Cụ thể, tỷ lệ làm trái ngành ở nhóm khoa học tự nhiên, toán và công nghệ thông tin khoảng 60,6%; nhân văn và nghệ thuật khoảng 63%; nông, lâm, ngư và thú y tới 67%. Ngược lại, nhóm kinh doanh và quản lý lại thấp nhất, khoảng 13,26%; còn kỹ thuật, công nghệ, kiến trúc và xây dựng ở mức 31,6%.",
					"Nói cách khác, học một ngành rồi làm công việc hơi khác đi là chuyện rất bình thường, không phải là dấu hiệu của thất bại.",
				],
			},
			{
				heading: "Vì sao trái ngành không đồng nghĩa với lãng phí",
				paragraphs: [
					"Phần lớn những gì bạn học được ở bậc đại học là kỹ năng nền: cách tư duy, cách tự học, cách giải quyết vấn đề và làm việc với người khác. Những thứ đó đi theo bạn sang bất kỳ công việc nào.",
					"Thị trường nghề nghiệp cũng thay đổi nhanh; nhiều vị trí hôm nay thậm chí chưa tồn tại khi bạn mới vào trường. Việc rẽ hướng để bắt kịp cơ hội mới đôi khi là một lựa chọn khôn ngoan, chứ không phải đi chệch đường.",
				],
			},
			{
				heading: "Chọn thế nào để bớt rủi ro trái ngành ngoài ý muốn",
				paragraphs: [
					"Nếu chưa thật chắc, hãy ưu tiên một nhóm ngành đủ rộng để còn rẽ nhánh về sau, và tập trung vào những kỹ năng lõi có giá trị lâu dài.",
					"Quan trọng nhất là tìm hiểu kỹ nghề thật sự làm gì trước khi chọn. Bạn có thể dùng phần Khám phá ngành và Hành trình Khám phá Bản thân trên trang này để hình dung rõ hơn con đường phía trước.",
				],
			},
		],
		sources: [
			{
				label: "Nhiều ngành đào tạo có hơn 60% sinh viên tốt nghiệp làm trái ngành",
				publisher: "Trường Quốc tế – ĐHQG Hà Nội",
				url: "https://www.is.vnu.edu.vn/nhieu-nganh-dao-tao-co-hon-60-sinh-vien-tot-nghiep-lam-trai-nganh/",
				year: "2024",
			},
		],
	},
	{
		slug: "nganh-cong-nghe-co-hoi",
		title: "Ngành công nghệ: cơ hội lớn nhưng không dễ dãi",
		description: "Nhu cầu nhân lực công nghệ rất cao, nhưng doanh nghiệp ngày càng tuyển khắt khe. Vài điều nên biết trước khi chọn.",
		category: "Xu hướng",
		readingMinutes: 6,
		updated: "2025-02-01",
		sections: [
			{
				heading: "Nhu cầu nhân lực rất lớn",
				paragraphs: [
					"Theo Báo cáo Thị trường IT Việt Nam của TopDev, những năm gần đây Việt Nam thiếu hụt khoảng 150.000 – 200.000 lập trình viên, kỹ sư mỗi năm. Báo cáo cũng ước tính đến năm 2025, ngành công nghệ thông tin cần khoảng 700.000 nhân lực mới.",
					"Các lĩnh vực như trí tuệ nhân tạo, dữ liệu, điện toán đám mây và an ninh mạng đang kéo nhu cầu tuyển dụng lên cao, và xu hướng này được dự báo còn kéo dài.",
				],
			},
			{
				heading: "Nhưng cánh cửa không tự mở",
				paragraphs: [
					"Cũng theo TopDev, trong khoảng 57.000 kỹ sư công nghệ ra trường mỗi năm, chỉ chừng 30% đáp ứng được yêu cầu thực tế của doanh nghiệp ngay; phần còn lại thường cần được đào tạo thêm 3 – 6 tháng để bắt nhịp công việc.",
					"Điều đó có nghĩa: tấm bằng là cần thiết nhưng chưa đủ. Nhà tuyển dụng nhìn vào kỹ năng thực hành, sản phẩm bạn từng làm, khả năng tiếng Anh và tinh thần tự học liên tục.",
				],
			},
			{
				heading: "Nếu bạn nhắm tới ngành công nghệ",
				paragraphs: [
					"Hãy học chắc nền tảng (toán, tư duy giải thuật) thay vì chạy theo công nghệ thời thượng; làm vài dự án thật để có thứ chứng minh năng lực; và đầu tư cho tiếng Anh từ sớm.",
					"Quan trọng không kém: hãy thành thật xem mình có thấy hứng thú khi ngồi mày mò giải quyết vấn đề hay không. Mức lương hấp dẫn sẽ khó bền nếu bạn không thực sự hợp với công việc.",
				],
			},
		],
		sources: [
			{
				label: "Báo cáo Thị trường IT Việt Nam 2024 – 2025",
				publisher: "TopDev",
				url: "https://topdev.vn/blog/bao-cao-thi-truong-it-viet-nam-2024/",
				year: "2024",
			},
		],
	},
	{
		slug: "chi-phi-hoc-dai-hoc",
		title: "Học phí và chi phí học đại học: tính trước cho đỡ bị động",
		description: "Học phí giữa các trường chênh nhau rất nhiều. Nhìn trước bức tranh chi phí để chọn ngành, chọn trường vừa sức gia đình.",
		category: "Tuyển sinh",
		readingMinutes: 6,
		updated: "2025-02-01",
		sections: [
			{
				heading: "Học phí chênh nhau rất nhiều",
				paragraphs: [
					"Theo thông tin học phí năm học 2024 – 2025, các trường công lập có mức rất khác nhau: nhiều chương trình kỹ thuật dao động vài chục triệu đồng một năm (ví dụ một số chương trình của ĐH Bách khoa Hà Nội khoảng 23 – 58 triệu, ĐH Đà Nẵng khoảng 9,8 – 32 triệu). Trường tư thục và chương trình quốc tế thường cao hơn, phổ biến từ 35 đến hơn 100 triệu đồng một năm.",
					"Khối ngành sức khỏe (Y, Dược) thường nằm trong nhóm học phí cao, nhiều nơi khoảng 30 – 90 triệu đồng một năm. Sau vài năm giữ ổn định, năm học 2024 – 2025 nhiều trường bắt đầu tăng học phí theo lộ trình, nên hãy xem kỹ thông báo mới nhất của từng trường.",
				],
			},
			{
				heading: "Đừng quên chi phí sinh hoạt",
				paragraphs: [
					"Ngoài học phí còn có tiền ăn ở, đi lại, tài liệu và các khoản học thêm (tiếng Anh, chứng chỉ nghề). Nếu học xa nhà ở thành phố lớn, riêng chi phí sinh hoạt thường rơi vào khoảng vài triệu đồng mỗi tháng.",
					"Cộng cả bốn năm, đây là một khoản đầu tư đáng kể của gia đình. Tính trước giúp bạn tránh cảnh giữa chừng phải bỏ dở vì đuối sức tài chính.",
				],
			},
			{
				heading: "Cách chủ động về tài chính",
				paragraphs: [
					"Có nhiều cách để nhẹ gánh: săn học bổng, tìm hiểu chính sách vay vốn ưu đãi cho sinh viên, chọn trường gần nhà, hoặc cân nhắc bậc cao đẳng và trường nghề nếu bạn muốn đi làm sớm.",
					"Và đừng ngại nói chuyện thẳng thắn với gia đình về điều kiện thực tế. Phần đối chiếu bối cảnh trong Hành trình Khám phá Bản thân được thiết kế để bạn cân nhắc cả yếu tố này khi chọn hướng đi.",
				],
			},
		],
		sources: [
			{
				label: "Học phí các trường Đại học năm học 2024 - 2025",
				publisher: "LuatVietnam",
				url: "https://luatvietnam.vn/linh-vuc-khac/hoc-phi-cac-truong-dai-hoc-883-97692-article.html",
				year: "2024",
			},
			{
				label: "Học phí mới nhất hơn 50 trường đại học trên cả nước",
				publisher: "Znews",
				url: "https://znews.vn/hoc-phi-moi-nhat-hon-50-truong-dai-hoc-tren-ca-nuoc-post1642337.html",
				year: "2024",
			},
		],
	},
]

export const ARTICLE_BY_SLUG: Record<string, Article> = Object.fromEntries(
	ARTICLES.map((a) => [a.slug, a]),
)
