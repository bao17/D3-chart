d3.csv("data.csv").then(function(data) {
  // Chuẩn hóa dữ liệu
  data.forEach(d => {
    d.SL = +d["SL"];
    d.DonGia = +d["Đơn giá"];
    d.DoanhThu = d.SL * d.DonGia;
    d.Thang = new Date(d["Thời gian tạo đơn"]).getMonth() + 1; // 1-12
  });

  // Gom nhóm theo Tháng
  let groupedMap = d3.group(data, d => d.Thang);
  let grouped = [];

  groupedMap.forEach((val, thang) => {
    grouped.push({
      Thang: thang,
      SL: d3.sum(val, d => d.SL),
      DoanhThu: d3.sum(val, d => d.DoanhThu),
      HienThi: `T${String(thang).padStart(2, "0")}`
    });
  });

  // Sắp xếp theo Tháng
  grouped.sort((a, b) => d3.ascending(a.Thang, b.Thang));

  // Thiết lập khung vẽ
  const svg = d3.select("#chart3"),
        margin = {top: 40, right: 50, bottom: 50, left: 100},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g")
               .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
              .domain(grouped.map(d => d.HienThi))
              .range([0, width])
              .padding(0.2);

  const y = d3.scaleLinear()
              .domain([0, d3.max(grouped, d => d.DoanhThu)])
              .range([height, 0]);

  // 🎨 12 màu cố định từ 3 palette (mỗi tháng 1 màu)
  const fixedColors = [
    "#264D59", "#43978D", "#F9E07F", "#F9AD6A", "#D46C4E", // palette 1
    "#015C92", "#2D82B5", "#d3844fff", "#e23b3bff", "#6750cfff", // palette 2
    "#5AA7A7", "#455054"                                  // palette 3
  ];

  const color = d3.scaleOrdinal()
                  .domain(grouped.map(d => d.Thang))
                  .range(fixedColors);

  // Trục X
  g.append("g")
   .attr("transform", `translate(0,${height})`)
   .call(d3.axisBottom(x))
   .selectAll("text")
   .style("font-size", "13px")
   .style("font-weight", "bold");

  // Trục Y (triệu VND)
  g.append("g")
   .call(d3.axisLeft(y).tickFormat(d => (d/1e6).toFixed(0) + "M"))
   .selectAll("text")
   .style("font-size", "13px")
   .style("font-weight", "bold");

  // Vẽ cột
  g.selectAll("rect")
    .data(grouped)
    .enter().append("rect")
      .attr("x", d => x(d.HienThi))
      .attr("y", d => y(d.DoanhThu))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.DoanhThu))
      .attr("fill", (d, i) => fixedColors[i % fixedColors.length])
      .append("title")
        .text(d => `${d.HienThi}\nDoanh thu: ${d3.format(",")(d.DoanhThu)} VND`);

  // Nhãn trên cột
  g.selectAll("text.value")
    .data(grouped)
    .enter().append("text")
      .attr("class", "value")
      .attr("x", d => x(d.HienThi) + x.bandwidth() / 2)
      .attr("y", d => y(d.DoanhThu) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(d => (d.DoanhThu / 1e6).toFixed(1) + "M");

  // Tiêu đề
  svg.append("text")
     .attr("x", (width + margin.left + margin.right) / 2)
     .attr("y", 20)
     .attr("text-anchor", "middle")
     .style("font-size", "18px")
     .style("font-weight", "bold")
     ;
});
