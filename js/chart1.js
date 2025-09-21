// Đọc dữ liệu CSV
d3.csv("data.csv").then(data => {
  // Chuyển đổi dữ liệu số và tính DoanhThu
  data.forEach(d => {
    d.SL = +d.SL;
    d["Đơn giá"] = +d["Đơn giá"];
    d.DoanhThu = d.SL * d["Đơn giá"];
  });

  // Nhóm dữ liệu
  const grouped = [];
  d3.group(data, d => d["Mã nhóm hàng"], d => d["Mã mặt hàng"], d => d["Tên mặt hàng"])
    .forEach((mapNhom, nhom) => {
      mapNhom.forEach((mapMa, ma) => {
        mapMa.forEach((rows, ten) => {
          grouped.push({
            Nhom: nhom,
            Ma: ma,
            Ten: ten,
            SL: d3.sum(rows, r => r.SL),
            DoanhThu: d3.sum(rows, r => r.DoanhThu),
            HienThi: `[${ma}] ${ten}`
          });
        });
      });
    });

  // Sắp xếp giảm dần
  grouped.sort((a, b) => d3.descending(a.DoanhThu, b.DoanhThu));

  const margin = { top: 30, right: 100, bottom: 40, left: 200 },
        width = 1000 - margin.left - margin.right,
        height = grouped.length * 30;

  const svg = d3.select("#chart1")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scale
  const x = d3.scaleLinear()
    .domain([0, d3.max(grouped, d => d.DoanhThu)]).nice()
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(grouped.map(d => d.HienThi))
    .range([0, height])
    .padding(0.1);

  // Gradient màu
  const gradientColors = {
    BOT: ["#1abc9c", "#16a085"],
    SET: ["#34495e", "#2c3e50"],
    THO: ["#e74c3c", "#c0392b"],
    TTC: ["#f39c12", "#d35400"],
    TMX: ["#7f8c8d", "#95a5a6"]
  };

  const defs = svg.append("defs");
  Object.entries(gradientColors).forEach(([key, [start, end]]) => {
    const linearGradient = defs.append("linearGradient")
      .attr("id", `gradient-${key}`)
      .attr("x1", "0%").attr("x2", "100%")
      .attr("y1", "0%").attr("y2", "0%");
    linearGradient.append("stop").attr("offset", "0%").attr("stop-color", start);
    linearGradient.append("stop").attr("offset", "100%").attr("stop-color", end);
  });

  // Tooltip div
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

  // Vẽ thanh + tooltip
  svg.selectAll("rect")
    .data(grouped)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", d => y(d.HienThi))
    .attr("width", d => x(d.DoanhThu))
    .attr("height", y.bandwidth())
    .attr("fill", d => `url(#gradient-${d.Nhom})`)
    .on("mouseover", (event, d) => {
      tooltip.style("opacity", 1)
        .html(`
          <strong>Mặt hàng</strong>[${d.Ma}] ${d.Ten}<br/>
          <strong>Nhóm hàng</strong>[${d.Nhom}] ${d.Nhom}<br/>
          <strong>Doanh số bán</strong>${d3.format(",")(d.DoanhThu)}
        `);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  // Nhãn giá trị (triệu VND)
  svg.selectAll("text.value")
  .data(grouped)
  .enter()
  .append("text")
  .attr("class", "value")
  .attr("x", d => x(d.DoanhThu) - 5)   // 🔹 trừ đi để nằm trong bar
  .attr("y", d => y(d.HienThi) + y.bandwidth()/2)
  .attr("dy", "0.35em")
  .attr("text-anchor", "end")          // 🔹 căn phải, để sát cuối bar
  .text(d => (d.DoanhThu/1e6).toFixed(0) + " triệu VND") // format 100M, 200M,...
  .style("font-size", "12px")
  .style("fill", "white")              // 🔹 chữ trắng để nổi bật trên bar màu
  .style("font-weight", "bold");

  // Trục
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5));

  svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));
});
