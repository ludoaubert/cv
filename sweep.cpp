#include <assert.h>
#include <vector>
#include <array>
#include <ranges>
#include <format>
#include <bitset>
#include <span>
#include <mdspan>
#include <algorithm>
//#include <generator>
#include <iterator>
#include <tuple>
#include <set>
//#include <flat_map> TODO. not yet available
//#include <flat_set> TODO. not yet available
#include <map>
#include <numeric>
#include <stdarg.h>
using namespace std;


inline void printf_(const char* fmt, ...) {
/*
	va_list args;
	va_start(args, fmt);
	vprintf(fmt, args);
	va_end(args);
*/
}

struct Edge {
	int from;
	int to;
	auto operator<=>(const Edge&) const = default;
};

enum NeighborDegree
{
	FIRST_DEGREE_NEIGHBOR,
	SECOND_DEGREE_NEIGHBOR,
	THIRD_DEGREE_NEIGHBOR
};

const char* NeighborDegreeString[3]=
{
	"1",
	"2",
	"3"
};

//TODO: generator, elements_of
/*
generator<int> adj(const vector<Edge>& edges, int from)
{
	auto rg = ranges::equal_range(edges, from, {}, &Edge::from)
		| views::transform([&](const Edge& e){
			return e.to;
		});
	co_yield ranges::elements_of(rg);
}
*/

vector<int> adj(const vector<Edge>& edges, int from)
{
        auto rg = ranges::equal_range(edges, from, {}, &Edge::from)
                | views::transform([&](const Edge& e){
                        return e.to;
                });
	return vector(begin(rg), end(rg));
}

//TODO: generator, elements_of
/*
generator<tuple<int,NeighborDegree> > adj(const vector<tuple<Edge,NeighborDegree> >& edges, int from)
{
	auto rg = ranges::equal_range(edges, from, {}, [](auto arg){auto [e,degree]=arg;return e.from;})
		| views::transform([&](const auto arg){
			auto [e,degree]=arg;
			return {e.to,degree};
		});
	co_yield ranges::elements_of(rg);
}
*/

vector<tuple<int,NeighborDegree> > adj(const vector<tuple<Edge,NeighborDegree> >& edges, int from)
{
        auto rg = ranges::equal_range(edges, from, {}, [](auto arg){auto [e,degree]=arg;return e.from;})
                | views::transform([&](const auto arg){
			auto [e,degree]=arg;
                        return make_tuple(e.to,degree);
                });
	return vector(begin(rg), end(rg));
}

enum Direction
{
	EAST_WEST,
	NORTH_SOUTH
};

const int NR_DIRECTIONS=2;

const Direction directions[2]={EAST_WEST, NORTH_SOUTH};

const char* DirectionString[2]={"EAST_WEST","NORTH_SOUTH"};

const int RECT_BORDER = 20;

enum RectDim
{
  LEFT,
  RIGHT,
  TOP,
  BOTTOM
} ;

const char* RectDimString[4]={"LEFT","RIGHT","TOP","BOTTOM"};

struct RectDimRange{ RectDim min, max;};

const RectDimRange rectDimRanges[2] = {
	{ LEFT, RIGHT },
	{ TOP, BOTTOM }
};

struct MyPoint
{
	int x, y;

	auto operator<=>(const MyPoint&) const = default;

	template <class Self>
	auto&& operator[](this Self&& self, Direction direction)
	{
		switch(direction)
		{
		case EAST_WEST:
				return self.x;
		case NORTH_SOUTH:
				return self.y;
		}
	}
};

struct MyRect
{
	int m_left, m_right, m_top, m_bottom ;

	auto operator<=>(const MyRect&) const = default;

	template <class Self>
	auto&& operator[](this Self&& self, RectDim rd)
	{
		switch(rd)
		{
		case LEFT:
			return self.m_left;
		case RIGHT:
			return self.m_right;
		case TOP:
			return self.m_top;
		case BOTTOM:
			return self.m_bottom;
		}
	}

	MyRect& operator+=(const MyPoint& p)
	{
		m_left += p.x;
		m_right += p.x;
		m_top += p.y;
		m_bottom += p.y;
		return *this;
	}
};


//Cf compute_box_rectangles.js
const int RECTANGLE_BOTTOM_CAP=200;

struct Line
{
        int from, to;
        MyPoint p1, p2;
};


inline int width(const MyRect& r)
{
        return r.m_right - r.m_left ;
}


inline int height(const MyRect& r)
{
        return r.m_bottom - r.m_top ;
}


int dim_max(const MyRect& r)
{
	return max(height(r), width(r)) ;
}


/*
dist is the euclidean distance between points
rect. 1 is formed by points (x1, y1) and (x1b, y1b)
rect. 2 is formed by points (x2, y2) and (x2b, y2b)
*/
inline float rect_distance(const MyRect& r1, const MyRect& r2)
{
	const auto& [x1, x1b, y1, y1b] = r1;
	const auto& [x2, x2b, y2, y2b] = r2;

	auto dist = [](const MyPoint& p1, const MyPoint& p2){
		const auto& [x1, y1] = p1;
		const auto& [x2, y2] = p2;
		return sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) );
	};

	bool left = x2b < x1;
	bool right = x1b < x2;
	bool bottom = y2b < y1;
	bool top = y1b < y2;

	if (top && left)
		return dist({x1, y1b}, {x2b, y2});
	else if (left && bottom)
		return dist({x1, y1}, {x2b, y2b});
	else if (bottom && right)
		return dist({x1b, y1}, {x2, y2b});
	else if (right && top)
		return dist({x1b, y1b}, {x2, y2});
	else if (left)
		return x1 - x2b;
	else if (right)
		return x2 - x1b;
	else if (bottom)
		return y1 - y2b;
	else if (top)
	return y2 - y1b;
	else             // rectangles intersect
		return 0;
}

vector<MyRect> str2rects(const char* rects)
{
	const string srects = rects + strlen("[{");
	const vector<MyRect> rectangles = srects
		| views::split("},{"sv)
		| views::transform([](auto rect){
			MyRect r;
			sscanf(&rect[0],R"("left":%d,"right":%d,"top":%d,"bottom":%d)",&r.m_left, &r.m_right, &r.m_top, &r.m_bottom);
			return r;
		})
		| ranges::to<vector>();
	return rectangles;
}

vector<Edge> str2links(const char* lks)
{
	const string slinks = lks + strlen("[{");
	const vector<Edge> links = slinks
		| views::split("},{"sv)
		| views::transform([](auto lk){
			int from, to;
			sscanf(&lk[0],R"("from":%d,"to":%d)",&from, &to);
			return Edge{from,to};
		})
		| ranges::to<vector>();
	return links;
}

vector<Line> str2lines(const char* lns)
{
	const string slines = lns + strlen("[{");
	const vector<Line> lines = slines
		| views::split("},{"sv)
		| views::transform([](auto ln){
			int from,to;
			MyPoint p1, p2;
                        sscanf(&ln[0],R"("from":%d,"to":%d,"p1":{"x":%d,"y":%d},"p2":{"x":%d,"y":%d})",
				&from, &to, &p1.x, &p1.y, &p2.x, &p2.y);
                        return Line{from,to,p1,p2};
                })
                | ranges::to<vector>();
	printf("lines.size()=%zu\n", lines.size());
        return lines;
}

inline int range_overlap(int left1, int right1, int left2, int right2)
{
	if (left2 >= right1)
		return 0 ;
	else if (left1 >= right2)
		return 0 ;
	else
		return std::min(right1,right2) - std::max(left1, left2) ;
}

int edge_overlap(const MyRect& r1, const MyRect& r2)
{
	if (r1.m_left == r2.m_right || r1.m_right == r2.m_left)
		return range_overlap(r1.m_top, r1.m_bottom, r2.m_top, r2.m_bottom) ;
	else if (r1.m_top == r2.m_bottom || r1.m_bottom == r2.m_top)
		return range_overlap(r1.m_left, r1.m_right, r2.m_left, r2.m_right) ;
	else
		return 0 ;
}

MyRect compute_frame(span<const MyRect> rectangles)
{
	return MyRect{
		.m_left = ranges::min(rectangles | views::transform(&MyRect::m_left)),
		.m_right = ranges::max(rectangles | views::transform(&MyRect::m_right)),
		.m_top = ranges::min(rectangles | views::transform(&MyRect::m_top)),
		.m_bottom = ranges::max(rectangles | views::transform(&MyRect::m_bottom))
	};
}

MyPoint dimensions(const MyRect& r)
{
	return MyPoint{.x = width(r), .y = height(r)} ;
}

int distance_between_ranges(int left1, int right1, int left2, int right2)
{
	if (left2 > right1)
		return left2 - right1 ;
	else if (left1 > right2)
		return left1 - right2 ;
	else
		return 0 ;
}


int rectangle_distance(const MyRect& r1, const MyRect& r2)
{
	if (r1.m_left > r2.m_right)
	{
		return r1.m_left - r2.m_right + distance_between_ranges(r1.m_top, r1.m_bottom, r2.m_top, r2.m_bottom) ;
	}
	else if (r1.m_right < r2.m_left)
	{
		return r2.m_left - r1.m_right + distance_between_ranges(r1.m_top, r1.m_bottom, r2.m_top, r2.m_bottom) ;
	}
	else if (r1.m_top > r2.m_bottom)
	{
		return r1.m_top - r2.m_bottom + distance_between_ranges(r1.m_left, r1.m_right, r2.m_left, r2.m_right) ;
	}
	else if (r1.m_bottom < r2.m_top)
	{
		return r2.m_top - r1.m_bottom + distance_between_ranges(r1.m_left, r1.m_right, r2.m_left, r2.m_right) ;
	}
	else
	{
//the two rectangles intersect.
		return 0 ;
	}
}


struct SweepLineItem
{
	int sweep_value;
	RectDim rectdim;
	int ri;

	auto operator<=>(const SweepLineItem&) const = default;
};


/*
		  |
		  |
		  |
--------------------->tr
		  |
		  |
		  V
		sweep

		  |
		  |
		  |
--------------------->sweep
		  |
		  |
		  V
		 tr
*/


struct RectLink
{
	Direction sweep_direction;
	int i;
	int j;
	int min_sweep_value, max_sweep_value=INT_MAX;
	auto operator<=>(const RectLink&) const = default;
};


struct TranslationRangeItem
{
	int id;
	int ri;
	MyPoint tr;

	friend bool operator==(const TranslationRangeItem&, const TranslationRangeItem&) = default;
};

inline bool intersect_strict(const MyRect& r1, const MyRect& r2)
{
        return !(r1.m_left >= r2.m_right || r1.m_right <= r2.m_left || r1.m_top >= r2.m_bottom || r1.m_bottom <= r2.m_top) ;
}

vector<RectLink> sweep(const Direction update_direction, const vector<MyRect>& rectangles)
{
	int n = rectangles.size();

/*
       links[0] ------>
<----- links[1]
*/
	vector<RectLink*> links_buffer(2*n, (RectLink*)0);
	auto links = mdspan(links_buffer.data(), n, 2);

	vector<SweepLineItem> sweep_line(2*n);

//use the sweep_line that is not impacted by selected translation
	Direction sweep_direction = Direction(1-update_direction);

	const auto [minUpdateRectDim, maxUpdateRectDim] = rectDimRanges[update_direction];  //{LEFT, RIGHT} or {TOP, BOTTOM}
	const auto [minSweepRectDim, maxSweepRectDim] = rectDimRanges[sweep_direction];

	auto proj=[&](int i){
		return make_tuple(
			rectangles[i][minUpdateRectDim],
			rectangles[i][maxUpdateRectDim],
			i);
	};

	auto cmp=[&](int i, int j){
		return proj(i) < proj(j);
	};

	set<int, decltype(cmp)> active_line(cmp);
	RectLink rect_links_buffer[1000];

	//sweep_line.reserve(2*n);

	for (int ri=0; ri < n; ri++)
	{
		sweep_line[2*ri] = SweepLineItem{.sweep_value=rectangles[ri][minSweepRectDim], .rectdim=minSweepRectDim, .ri=ri};
		sweep_line[2*ri+1] = SweepLineItem{.sweep_value=rectangles[ri][maxSweepRectDim], .rectdim=maxSweepRectDim, .ri=ri};
	}

	auto pr=[&](const SweepLineItem& a){
		const auto [sweep_value, rectdim, ri] = a;
		return make_tuple(
			rectangles[ri][rectdim],
			-rectdim,	//RIGHT < LEFT and BOTTOM < TOP
			ri);
	};

	ranges::sort(sweep_line, {}, pr);

	int rect_links_size=0;

	auto erase=[&](SweepLineItem& sweep_line_item){

		auto& [sweep_value, rectdim, i] = sweep_line_item;

		const auto it = active_line.find(i);
		printf_("*it = %d\n", *it);

		for (int LEG : {0,1})
		{
			RectLink *rl = links[i,LEG];
			if (rl != 0)
				rl->max_sweep_value = min(rectangles[i][rectdim], rl->max_sweep_value);
		}

		auto it_prev = std::next(it, -1), it_next = std::next(it);

		if (it != begin(active_line) && it_next != end(active_line))
		{
			rect_links_buffer[rect_links_size++] = RectLink{
				.sweep_direction = sweep_direction,
				.i = *it_prev,
				.j = *it_next,
				.min_sweep_value = sweep_value,
				.max_sweep_value = INT_MAX
			};

			if (RectLink *rl=links[*it_prev,1]; rl!=0)
				rl->max_sweep_value = min(sweep_value,rl->max_sweep_value);
			if (RectLink *rl=links[*it_next,0]; rl!=0)
				rl->max_sweep_value = min(sweep_value,rl->max_sweep_value);
			links[*it_prev,1] = links[*it_next,0] = & rect_links_buffer[rect_links_size - 1];
		}

		active_line.erase(it);
	};

	auto insert=[&](SweepLineItem& sweep_line_item){

		auto& [sweep_value, rectdim, i] = sweep_line_item;

		auto [it,ret] = active_line.insert(i);
		printf_("*it = %d\n", *it);

		if (it != begin(active_line))
		{
			auto it_prev = std::next(it,-1);

			rect_links_buffer[rect_links_size++] = RectLink{
				.sweep_direction = sweep_direction,
				.i = *it_prev,
				.j= *it,
				.min_sweep_value = sweep_value,
				.max_sweep_value = INT_MAX
			};

			if (RectLink *rl = links[*it,0]; rl!=0)
				rl->max_sweep_value = min(sweep_value,rl->max_sweep_value);
			if (RectLink *rl = links[*it_prev,1]; rl!=0)
				rl->max_sweep_value = min(sweep_value,rl->max_sweep_value);
			links[*it,0] = links[*it_prev,1] = & rect_links_buffer[rect_links_size - 1];
		}

		auto it_next = std::next(it);

		if (it_next != end(active_line))
		{
			rect_links_buffer[rect_links_size++] = RectLink{
				.sweep_direction = sweep_direction,
				.i = *it,
				.j = *it_next,
				.min_sweep_value = sweep_value,
				.max_sweep_value = INT_MAX
			};

			if (RectLink *rl=links[*it,1]; rl!=0)
				rl->max_sweep_value = min(sweep_value, rl->max_sweep_value);
			if (RectLink *rl=links[*it_next,0]; rl!=0)
				rl->max_sweep_value = min(sweep_value, rl->max_sweep_value);
			links[*it,1] = links[*it_next,0] = &rect_links_buffer[rect_links_size - 1];
		}
	};

	auto print_active_line=[&](){
		char buffer[5000];
		int pos=0;
		pos += sprintf(buffer + pos, ".active_line={");
		for (int i : active_line)
		{
			pos += sprintf(buffer + pos, " %d,", i);
		}
		pos += sprintf(buffer + --pos, "}\n");
		buffer[pos]=0;
		printf_("%s", buffer);
	};

	for (SweepLineItem& item : sweep_line)
	{
		const auto& [sweep_value, rectdim, ri] = item;
		switch(rectdim)
		{
		case LEFT:
		case TOP:
			printf_("sweep reaching %d %s\n", ri, RectDimString[rectdim]);
			printf_("before insert\n");
			print_active_line();
			insert(item);
			printf_("after insert\n");
			print_active_line();
			break;
		case RIGHT:
		case BOTTOM:
			printf_("sweep leaving %d %s\n", ri, RectDimString[rectdim]);
			printf_("before erase\n");
			print_active_line();
			erase(item);
			printf_("after erase\n");
			print_active_line();
			break;
		}
	}

	for (const auto [sweep_value, rectdim, ri] : sweep_line)
	{
		printf_("{.sweep_value=%d, .rectdim=%s, .ri=%d},\n", sweep_value, RectDimString[rectdim], ri);
	}

	sort(rect_links_buffer, rect_links_buffer + rect_links_size);

	auto rg = views::counted(rect_links_buffer, rect_links_size) |
		views::filter([](const RectLink& rl){return rl.min_sweep_value != rl.max_sweep_value;});

	printf_("rect_links:[\n");
	for (const auto& [sweep_direction, i, j, min_sweep_value, max_sweep_value] : rg)
	{
		printf_("{.i=%d, .j=%d, .%s=%d, .%s=%d},\n", i, j,
			RectDimString[minSweepRectDim], min_sweep_value, RectDimString[maxSweepRectDim], max_sweep_value);
	}
	printf_("]\n");

	vector<RectLink> result = rg | ranges::to<vector>();
	printf_("result.size()=%zu\n", result.size());
	return result;
}


vector<MyRect> compute_holes(const vector<MyRect>& input_rectangles)
{
	const MyRect frame={
		.m_left=ranges::min(input_rectangles | views::transform(&MyRect::m_left)),
		.m_right=ranges::max(input_rectangles | views::transform(&MyRect::m_right)),
		.m_top=ranges::min(input_rectangles | views::transform(&MyRect::m_top)),
		.m_bottom=ranges::max(input_rectangles | views::transform(&MyRect::m_bottom))
	};

	const vector<MyRect> borders = {
		{.m_left=frame.m_left-10, .m_right=frame.m_left, .m_top=frame.m_top, .m_bottom=frame.m_bottom},
		{.m_left=frame.m_right, .m_right=frame.m_right+10, .m_top=frame.m_top, .m_bottom=frame.m_bottom},
		{.m_left=frame.m_left, .m_right=frame.m_right, .m_top=frame.m_top-10, .m_bottom=frame.m_top},
		{.m_left=frame.m_left, .m_right=frame.m_right, .m_top=frame.m_bottom, .m_bottom=frame.m_bottom+10}
	};

	auto next=[&](const vector<MyRect>& in_holes){

//TODO: views::concat()
		auto il = {input_rectangles, in_holes, borders};
		vector<MyRect> rectangles = il | views::join | ranges::to<vector>() ;

		const Direction update_directions[2] = {EAST_WEST, NORTH_SOUTH};

		vector<MyRect> holes = update_directions |
			views::transform([&](Direction  update_direction){
				const vector<RectLink> rect_links = sweep(update_direction, rectangles);
				printf_("rect_links.size()=%zu\n", rect_links.size());
				const vector<MyRect> holes = rect_links
					| views::transform([&](const RectLink& lnk)->MyRect{
						const auto [sweep_direction, i, j, min_sweep_value, max_sweep_value] = lnk;
						const MyRect &ri=rectangles[i], &rj=rectangles[j];
						switch(update_direction)
						{
						case EAST_WEST:
							return MyRect{.m_left=ri.m_right, .m_right=rj.m_left, .m_top=min_sweep_value, .m_bottom=max_sweep_value};
						case NORTH_SOUTH:
							return MyRect{.m_left=min_sweep_value, .m_right=max_sweep_value, .m_top=ri.m_bottom, .m_bottom=rj.m_top};
						}
					})
					| views::filter([](const MyRect& r){return r.m_left < r.m_right && r.m_top < r.m_bottom;})
					| ranges::to<vector>();
				return holes;
			}) |
			views::join |
			ranges::to<vector>();

		printf_("holes.size()=%zu\n", holes.size());
		int n = holes.size();
		const vector<float> dim_spread = holes |
			views::transform([](const MyRect& r)->float{
				const int dim[2] = {width(r), height(r)};
				auto [min,Max] = ranges::minmax(dim);
				return (float)(Max - min) / (float)(Max + min);
			}) | ranges::to<vector>();

//TODO: views::cartesian_product
		vector<pair<int,int> > cp;
		for (int i : views::iota(0,n))
			for (int j : views::iota(0,n))
				cp.push_back(make_pair(i,j));

		auto rg = views::iota(0, n);
		vector<Edge> inter = //views::cartesian_product(rg, rg)
			cp
			| views::transform([](auto arg){
				auto [i, j] = arg ;	return Edge{.from=i, .to=j};
			})
			| views::filter([&](const Edge& e){
				return e.from != e.to && intersect_strict(holes[e.from], holes[e.to]);
			})
			| ranges::to<vector>() ;

		ranges::sort(inter, {}, [&](const Edge& e){return dim_spread[e.to];}) ;

		vector<int> suppressed(holes.size(), 0);
		suppressed = ranges::fold_left(inter | views::reverse, suppressed,
			[](vector<int> suppressed, const Edge& e){
				if (suppressed[e.from]==0)
					suppressed[e.to] = 1;
				return suppressed;
			}
		);

		holes = views::iota(0,n)
			| views::filter([&](int i){return suppressed[i]==0;})
			| views::transform([&](int i){return holes[i];})
			| ranges::to<vector>();

		return holes;
	};

	vector<MyRect> holes, next_holes;
	vector<vector<MyRect> > vv ;

	while ( !(next_holes = next(holes)).empty() )
	{
		vv.push_back(next_holes);
		holes = vv | views::join | ranges::to<vector>();
	}

//TODO: views::join_with
	const string buffer = vv
		| views::transform([](const auto v){return format("{},", v.size());})
		| views::join
		| ranges::to<string>();
	printf("vv={%s}\n", buffer.c_str());

	return holes;
}


vector<MyRect> compute_holes_with_border(const vector<MyRect>& input_rectangles)
{
	const vector<MyRect> rects_with_border = input_rectangles
		| views::transform([&](const MyRect& r){
			return MyRect{
				.m_left = r.m_left - RECT_BORDER,
				.m_right = r.m_right + RECT_BORDER,
				.m_top = r.m_top - RECT_BORDER,
				.m_bottom = r.m_bottom + RECT_BORDER
			};
		}) | ranges::to<vector>();

	const int RECTANGLE_HEIGHT_CAP = RECTANGLE_BOTTOM_CAP + 2*RECT_BORDER;
	const int RECTANGLE_WIDTH_CAP = RECTANGLE_HEIGHT_CAP;

	const vector<MyRect> holes_with_border = compute_holes(rects_with_border)
		| views::transform([&](const MyRect& r){
			const int n = floor(1 + height(r)*1.0f / RECTANGLE_HEIGHT_CAP);
			auto rg = views::iota(0,n)
				| views::transform([&](int i)/*->generator<MyRect>*/{
					return MyRect{
						.m_left = r.m_left,
						.m_right = r.m_right,
						.m_top = r.m_top + i*RECTANGLE_HEIGHT_CAP,
						.m_bottom = min(r.m_top + (i+1)*RECTANGLE_HEIGHT_CAP, r.m_bottom)
						};
				}) | views::filter([](const MyRect& r){
					return r.m_top < r.m_bottom;
				});
			//co_yield ranges::elements_of(rg);
			return vector(begin(rg), end(rg));
		}) | views::join
		| views::transform([&](const MyRect& r){
			const int n = floor(1 + width(r)*1.0f / RECTANGLE_WIDTH_CAP);
			auto rg = views::iota(0,n)
				| views::transform([&](int i)/*->generator<MyRect>*/{
					return MyRect{
						.m_left = r.m_left + i * RECTANGLE_WIDTH_CAP,
						.m_right = min(r.m_left+(i+1)*RECTANGLE_WIDTH_CAP,r.m_right),
						.m_top=r.m_top,
						.m_bottom=r.m_bottom
					};
				}) | views::filter([&](const MyRect& r){
					return r.m_left < r.m_right;
				});
			//co_yield ranges::elements_of(rg);
			return vector(begin(rg), end(rg));
		}) | views::join
		| ranges::to<vector>();

	const vector<MyRect> holes = holes_with_border
		| views::filter([&](const MyRect& r){
			return width(r) > 2*RECT_BORDER;
		}) | views::filter([&](const MyRect& r){
			return height(r) > 2*RECT_BORDER;
		}) | views::transform([](const MyRect& h){
			return MyRect{
				.m_left = h.m_left + RECT_BORDER,
				.m_right = h.m_right - RECT_BORDER,
				.m_top = h.m_top + RECT_BORDER,
				.m_bottom = h.m_bottom - RECT_BORDER
			};
		}) | ranges::to<vector>();

	return holes;
}


void spread(Direction update_direction, const vector<RectLink>& rect_links, span<MyRect> rectangles)
{
//TODO: use chunk_by C++23
	const int N=30;
	int n = rectangles.size();

	MyPoint translations[N];

	ranges::fill(translations, MyPoint{0,0});

	auto [minUpdateRectDim, maxUpdateRectDim] = rectDimRanges[update_direction];  //{LEFT, RIGHT} or {TOP, BOTTOM}

	auto rec_push_hole=[&](this auto&& self, int ri, int tr)->void{

		printf_("entering rec_push_hole(ri=%d ,tr=%d)\n", ri, tr);

		for (const RectLink& rl : ranges::equal_range(rect_links, ri, {}, &RectLink::i))
		{
			int tr2= rectangles[ri][maxUpdateRectDim] - rectangles[rl.j][minUpdateRectDim];

			if (tr2 < 0)
				tr2 = 0;

			self(rl.j, tr+tr2);
		}
		int &tri = translations[ri][update_direction];
		tri = max<int16_t>(tri, tr) ;
	};


	vector<RectLink> index = rect_links;
	ranges::sort(index, {}, &RectLink::j);
	vector<int> root_nodes;
	ranges::set_difference(views::iota(0,n),
				index | views::transform(&RectLink::j),
				back_inserter(root_nodes)
				);
	for (int j : root_nodes)
	{
		int tr=0;
		rec_push_hole(j, tr);
	}


	for (const auto& [x, y] : views::counted(translations, n))
	{
		printf_("{.x=%d, .y=%d},", x, y);
	}
	printf_("\n");

	for (int ri=0; ri < n; ri++)
	{
		rectangles[ri] += translations[ri];
	}
}


void compact(Direction update_direction,
		const vector<RectLink>& rect_links,
		const vector<Edge>& edges,
		span<const MyRect> input_rectangles,
		span<MyRect> rectangles)
{
	printf_("begin compact\n");
	auto [minUpdateRectDim, maxUpdateRectDim] = rectDimRanges[update_direction];  //{LEFT, RIGHT} or {TOP, BOTTOM}

	const int n = rectangles.size();

	vector<vector<TranslationRangeItem> > vv(10);
	int id=0;

	auto next=[&](const vector<TranslationRangeItem>& prev)->vector<TranslationRangeItem>
	{
		ranges::copy(input_rectangles, begin(rectangles));
		ranges::for_each(prev, [&](const TranslationRangeItem& item){
			const auto& [id, ri, tr] = item;
			rectangles[ri] += tr;
		});

		id++;

		auto rg = rectangles | views::transform([&](const MyRect& r){return r[minUpdateRectDim];});
		const int frame_min = ranges::min(rg);
		const int next_min = ranges::min(rg | views::filter([&](int value){return value != frame_min;}));

		printf_("frame_min=%d\n", frame_min);
		printf_("next_min=%d\n", next_min);

		bitset<30> partition;

		auto selected_rect_links = rect_links | views::filter([&](const RectLink& lnk){return rectangles[lnk.i][maxUpdateRectDim] == rectangles[lnk.j][minUpdateRectDim];});
		vector<vector<int> > vv(20);
		vv[0] = views::iota(0,n) |
			views::filter([&](int i){return rectangles[i][minUpdateRectDim]==frame_min;}) |
			ranges::to<vector>();

		partial_sum(vv.begin(), vv.end(), vv.begin(),
			[&](const vector<int>& prev, const vector<int>&){
				vector<int> next = prev |
					views::transform([&](int i){
						auto r = ranges::equal_range(selected_rect_links, i, {}, &RectLink::i) |
							views::transform(&RectLink::j);
						return r;
					}) |
					views::join |
					ranges::to<vector>();
				return next;
			}
		);

		ranges::for_each(vv | views::join, [&](int i){partition[i]=1;});

		auto r = rect_links |
			views::filter([&](const RectLink& e){return partition[e.i] > partition[e.j];}) |
			views::transform([&](const RectLink& e){return rectangles[e.j][minUpdateRectDim]-rectangles[e.i][maxUpdateRectDim];}) ;

		vector<TranslationRangeItem> translation_ranges;

		if (ranges::empty(r))
			return translation_ranges;

		MyPoint tr={.x=0, .y=0};
		tr[update_direction] = min<int>(ranges::min(r), next_min - frame_min);

		auto rg2 = views::iota(0,n) |
			views::filter([&](int i){return partition[i]==1;}) |
			views::transform([&](int i){return TranslationRangeItem{.id=id,.ri=i,.tr=tr};});

		ranges::for_each(rg2, [&](const TranslationRangeItem& item){const auto [id, ri, tr]=item; rectangles[ri]+=tr;});

		translation_ranges = views::iota(0,n) |
			views::filter([&](int i){return rectangles[i][minUpdateRectDim] != input_rectangles[i][minUpdateRectDim];}) |
			views::transform([&](int i){
				MyPoint tr;
				tr[update_direction] = rectangles[i][minUpdateRectDim] - input_rectangles[i][minUpdateRectDim];
				return TranslationRangeItem{.id=id, .ri=i, .tr=tr};
			}) |
			ranges::to<vector>();
		for (const auto [id, ri, tr] : translation_ranges)
		{
			printf_("{.id=%d, .ri=%d, .tr={.x=%d, .y=%d}},\n", id, ri, tr.x, tr.y);
		}
		return translation_ranges;
	};

//10: just had to choose a number. Should not be needed with C++23 partial_fold()
// Cf https://stackoverflow.com/questions/74042325/listing-all-intermediate-recurrence-results

	partial_sum(vv.begin(), vv.end(), vv.begin(),
		[&](const vector<TranslationRangeItem>& prev, const vector<TranslationRangeItem>&){
			return next(prev);}
	);

	auto rg = vv | views::join;

	printf_("rg = vv | views::join\n");

	for (const auto [id, ri, tr] : rg)
	{
		printf_("{.id=%d, .ri=%d, .tr={.x=%d, .y=%d}},\n", id, ri, tr.x, tr.y);
	}

	if (ranges::empty(rg))
	{
		printf_("end compact\n");
		return ;
	}

//TODO: use C++23 chunk_by()
//TODO: structured binding in Lambda would simplify the code.

	const int nb = 1 + ranges::max(rg | views::transform(&TranslationRangeItem::id));

	auto cost_fn=[&](int id){

		ranges::copy(input_rectangles, begin(rectangles));
		ranges::for_each(ranges::equal_range(rg, id, {}, &TranslationRangeItem::id),
				[&](const TranslationRangeItem& item){const auto [id, ri, tr]=item; rectangles[ri]+=tr;});

		const int sigma_edge_distance = ranges::fold_left(edges |
			views::transform([&](const Edge& le){ return rectangle_distance(rectangles[le.from],rectangles[le.to]);  }),
			0, plus<int>());

		const int sigma_translation = ranges::fold_left(ranges::equal_range(rg, id, {}, &TranslationRangeItem::id) |
			views::transform([&](const TranslationRangeItem& item){const auto [id,i,tr]=item; return abs(tr.x) + abs(tr.y);}),
			0, plus<int>());

		const auto [width, height] = dimensions(compute_frame(rectangles));

		const int sigma_edge_overlap = ranges::fold_left(edges |
			views::transform([&](const Edge& le){    return edge_overlap(rectangles[le.from],rectangles[le.to]);  }),
			0, plus<int>());

		printf_("id = %d\n", id);
		printf_("sigma_edge_distance = %d\n", sigma_edge_distance);
		printf_("sigma_translation = %d\n", sigma_translation);
		printf_("[.width=%d, .height=%d]\n", width, height);
		printf_("sigma_edge_overlap = %d\n", sigma_edge_overlap);

		int cost = width + height + width*height + sigma_edge_distance + sigma_translation - sigma_edge_overlap;

		printf_("cost = %d\n", cost);

		return cost;
	};

	vector<int> costs = views::iota(0,nb) |
		views::transform(cost_fn) |
		ranges::to<vector>();

	auto it = ranges::min_element(costs);
	id = std::distance(costs.begin(), it);
	printf_("id=%d\n", id);

	ranges::copy(input_rectangles, begin(rectangles));
	ranges::for_each(ranges::equal_range(rg, id, {}, &TranslationRangeItem::id),
			[&](const TranslationRangeItem& item){const auto [id, ri, tr]=item; rectangles[ri]+=tr;});
	printf_("end compact\n");
}

int sigma_segment_length(const vector<Line> &lines)
{
	auto rg = lines
		| views::transform([](const Line& line){
			const auto [from, to, p1, p2] = line;
			return abs(p1.x - p2.x) + abs(p1.y - p2.y);
		});
	const int sigma = ranges::fold_left(rg, 0, plus<int>());
	return sigma;
}

int count_segment_crossings(const vector<Line> &lines)
{
	const vector<MyRect> rects = lines
		| views::transform([](const Line& line){
			const auto [from, to, p1, p2] = line;
			return MyRect{
				.m_left=min(p1.x,p2.x),
				.m_right=max(p1.x,p2.x),
				.m_top=min(p1.y,p2.y),
				.m_bottom=max(p1.y,p2.y)
			};
		}) | ranges::to<vector>();

//TODO: views::cartesian_product

	vector<pair<int,int> > pairs;
	for (int i=0; i < rects.size(); i++)
		for (int j=0; j < rects.size(); j++)
			pairs.emplace_back(i,j);

	auto rg = pairs
		| views::filter([&](auto p){
			auto [i,j]=p;
			return i < j;
		}) | views::filter([&](auto p){
			auto [i,j]=p;
			return intersect_strict(rects[i], rects[j]);
		});

	const int count = ranges::distance(rg);
	return count;
}

struct RectDimRank
{
	int rec;
	RectDim rectdim;
	int rank;
	int gap;
	int hole_cardinality;
	int rect_cardinality;
	int link_count;
};


const vector<RectDimRank> compute_instability(const vector<MyRect> &rectangles, const vector<MyRect> &holes, const vector<Edge> &links)
{
	const int nr = rectangles.size();

//TODO: views::concat

	auto il = {rectangles, holes};
	const vector<MyRect> v = il | views::join | ranges::to<vector>();
	const int n = v.size();

	auto sign=[](RectDim rectdim){
		switch (rectdim)
		{
		case LEFT:
		case TOP:
			return +1;
		case RIGHT:
		case BOTTOM:
			return -1;
		}
	};

	const RectDim rectdims[4]={LEFT,RIGHT,TOP,BOTTOM};
	const vector<RectDimRank> ranks = rectdims
		| views::transform([&](RectDim rectdim){
			vector<int> sorted_indices = views::iota(0,n) | ranges::to<vector>();
			auto proj=[&](int i){	return v[i][rectdim] * sign(rectdim);	};
			ranges::sort(sorted_indices, {}, proj);

			const vector<RectDimRank> ranks = views::iota(0,n)
				| views::transform([&](int i){
					const auto rg = ranges::equal_range(sorted_indices, proj(i), {}, proj);
					int hole_cardinality = ranges::distance(rg | views::filter([&](int i){return i>=nr;}));
					int rect_cardinality = ranges::distance(rg | views::filter([&](int i){return i<nr;}));
					const auto it = begin(rg);
					int rank = distance(begin(sorted_indices), it);
					const auto it_next = std::next(it, hole_cardinality + rect_cardinality - 1 + 1);
					int gap = it_next == end(sorted_indices) ? 0 : proj(*it) - proj(*it_next);

					auto adj = ranges::equal_range(links, i, {}, &Edge::from);
					int link_count = ranges::distance(adj);
					int rec = i;
					return RectDimRank{rec, rectdim, rank, gap, hole_cardinality, rect_cardinality, link_count};
				}) | ranges::to<vector>();
			return ranks;
		}) | views::join
/*		}) | views::stride(n)
		}) | views::transform([](auto rg){
			Instability instability;
			copy(rg,instability.rectdim_ranks);
			return instability;
		})*/
		| ranges::to<vector>();

	return ranks;
}


struct HoleCoverageLink
{
	int h, from, to;
	bool suppressed;
	auto operator<=>(const HoleCoverageLink&) const = default;
};


vector<HoleCoverageLink> compute_coverage(const vector<MyRect> &holes, const vector<Line> &lines)
{
	const vector<MyRect> rects = lines
		| views::transform([](const Line& line){
			const auto [from, to, p1, p2] = line;
			return MyRect{
				.m_left=min(p1.x,p2.x),
				.m_right=max(p1.x,p2.x),
				.m_top=min(p1.y,p2.y),
				.m_bottom=max(p1.y,p2.y)
			};
		}) | ranges::to<vector>();

//TODO: views::cartesian_product

	vector<pair<int,int> > pairs;
	for (int i=0; i < holes.size(); i++)
		for (int j=0; j < rects.size(); j++)
			pairs.emplace_back(i,j);

	const vector<HoleCoverageLink> edges = pairs
		| views::filter([&](auto p){
			auto [i,j]=p;
			return intersect_strict(holes[i], rects[j]);
		}) | views::transform([&](auto p){
			auto [i,j]=p;
			const auto [from, to, p1, p2] = lines[j];
			return HoleCoverageLink{.h=i, .from=from, .to=to, .suppressed=false};
		}) | ranges::to<set>()	//dedup. TODO: flat_set
		| ranges::to<vector>();

	printf_("edges.size()=%zu\n", edges.size());

	return edges;
}

vector<Edge> compute_neighbors(const vector<MyRect> &rectangles, const vector<MyRect> &holes={})
{
//TODO: views::concat

	auto il = {rectangles, holes};
	const vector<MyRect> v = il | views::join | ranges::to<vector>();

	Direction update_directions[2] = {EAST_WEST, NORTH_SOUTH};

	vector<Edge> edges = update_directions
		| views::transform([&](const Direction update_direction){
			return sweep(update_direction, v);
		})
		| views::join
		| views::filter([&](const RectLink &lk){
			static int call=0;
			const auto [sweep_direction, i, j, min_sweep_value, max_sweep_value] = lk;
			printf_("%d {.sweep_direction=%s,.i=%d,.j=%d,.min_sweep_value=%d,.max_sweep_value=%d}\n",
				call++, DirectionString[sweep_direction],i,j,min_sweep_value,max_sweep_value);
			const Direction update_direction = (Direction)(1 - sweep_direction);
			printf_("update_direction=%s\n", DirectionString[update_direction]);
			const auto [minUpdateRectDim, maxUpdateRectDim] = rectDimRanges[update_direction];  //{LEFT, RIGHT} or {TOP, BOTTOM}
			printf_("minUpdateRectDim=%s, maxUpdateRectDim=%s\n",
				RectDimString[minUpdateRectDim], RectDimString[maxUpdateRectDim]);
			printf_("v[%d][%s]=%d\n", i, RectDimString[minUpdateRectDim], v[i][minUpdateRectDim]);
			printf_("v[%d][%s]=%d\n", j, RectDimString[minUpdateRectDim], v[j][minUpdateRectDim]);
			bool b = v[j][minUpdateRectDim] < v[i][minUpdateRectDim];
			printf_("b=%s\n", b ? "true" : "false");
			const MyRect &L = v[b ? j : i], &R = v[b ? i : j];
			printf_("max_sweep_value - min_sweep_value=%d\n", max_sweep_value - min_sweep_value);
			printf_("R[%s]=%d\n", RectDimString[minUpdateRectDim], R[minUpdateRectDim]);
			printf_("L[%s]=%d\n", RectDimString[maxUpdateRectDim], L[maxUpdateRectDim]);
			printf_("R[%s] - L[%s] = %d\n", RectDimString[minUpdateRectDim], RectDimString[maxUpdateRectDim],
				R[minUpdateRectDim] - L[maxUpdateRectDim]);
			return max_sweep_value - min_sweep_value >= RECT_BORDER &&
				R[minUpdateRectDim] - L[maxUpdateRectDim] <= 5 * RECT_BORDER;
		})
		| views::transform([&](const RectLink &lk){
			return array{ Edge{.from=lk.i, .to=lk.j}, Edge{.from=lk.j, .to=lk.i} };
		})
		| views::join
		| ranges::to<vector>();

	ranges::sort(edges);
	return edges;
}

vector<Edge> compute_second_degree_neighbors(const vector<MyRect> &rectangles, const vector<MyRect> &holes={})
{
	const vector<Edge> neighbors = compute_neighbors(rectangles, holes);

//TODO: generator, ranges::elements_of
	const vector<Edge> second_degree_neighbors = neighbors
		| views::transform([&](const Edge& e1)/*->generator<Edge>*/{
			auto rg = ranges::equal_range(neighbors, e1.to, {}, &Edge::from)
				| views::transform([&](const Edge& e2){
					return Edge{.from=e1.from,.to=e2.to};
				});
//			co_yield ranges::elements_of(rg);
			return vector(begin(rg), end(rg));
		}) | views::join
		| ranges::to<set>()	//TODO: flat_set to dedup and sort
		| ranges::to<vector>();

	vector<Edge> result;
	ranges::set_difference(second_degree_neighbors, neighbors, back_inserter(result));

	return result;
}

vector<Edge> compute_third_degree_neighbors(const vector<MyRect> &rectangles, const vector<MyRect> &holes={})
{
	const vector<Edge> neighbors = compute_neighbors(rectangles, holes);
	const vector<Edge> second_degree_neighbors = compute_second_degree_neighbors(rectangles, holes);

//TODO: generator, ranges::elements_of
	const vector<Edge> third_degree_neighbors = neighbors
		| views::transform([&](const Edge& e1)/*->generator<Edge>*/{
			auto rg = ranges::equal_range(neighbors, e1.to, {}, &Edge::from)
				| views::transform([&](const Edge& e2){
					return Edge{.from=e1.from,.to=e2.to};
				});
//			co_yield ranges::elements_of(rg);
			return vector(begin(rg), end(rg));
		}) | views::join
		| views::transform([&](const Edge& e1)/*->generator<Edge>*/{
			auto rg = ranges::equal_range(neighbors, e1.to, {}, &Edge::from)
				| views::transform([&](const Edge& e2){
					return Edge{.from=e1.from,.to=e2.to};
			});
//			co_yield ranges::elements_of(rg);
			return vector(begin(rg), end(rg));
		}) | views::join
		| ranges::to<set>()	//TODO: flat_set to dedup and sort
		| ranges::to<vector>();

	vector<Edge> third_degree_neighbors_;
	ranges::set_difference(third_degree_neighbors, second_degree_neighbors, back_inserter(third_degree_neighbors_));
        vector<Edge> _third_degree_neighbors;
        ranges::set_difference(third_degree_neighbors_, neighbors, back_inserter(_third_degree_neighbors));

	return _third_degree_neighbors;
}


vector<tuple<Edge,NeighborDegree> > compute_multi_degree_neighbors(const vector<MyRect> &rectangles, const vector<MyRect> &holes={})
{
	const vector<Edge> first_degree_neighbors = compute_neighbors(rectangles, holes);
	const vector<Edge> second_degree_neighbors = compute_second_degree_neighbors(rectangles, holes);
	const vector<Edge> third_degree_neighbors = compute_third_degree_neighbors(rectangles, holes);

	const vector<Edge> degree_neighbors3[3]={
		first_degree_neighbors,
		second_degree_neighbors,
		third_degree_neighbors
	};

//TODO: generator, elements_of, flat_set, views::enumerate
	const vector<tuple<Edge,NeighborDegree> > multi_degree_neighbors = span(degree_neighbors3, 3)
		| views::transform([&](const vector<Edge>& degree_neighbors){
			NeighborDegree degree = (NeighborDegree) std::distance(degree_neighbors3, &degree_neighbors);
			auto rg = degree_neighbors | views::transform([&](const Edge& e){return make_tuple(e, degree);});
			//co_yield ranges::elements_of(rg);
			return vector(begin(rg), end(rg));
		}) | views::join
		| ranges::to<set>()
		| ranges::to<vector>();

	return multi_degree_neighbors;
}

//passed links must be bidirectional
vector<tuple<int,int,MyRect,MyRect> > optimize_layout(const vector<MyRect> &rectangles, const vector<Edge> &links, const vector<Line> lines)
{
	const int n = rectangles.size();

	const vector<MyRect> holes = compute_holes_with_border(rectangles);

//TODO: views::concat
        auto il = {rectangles, holes};
        const vector<MyRect> v = il | views::join | ranges::to<vector>();

	const vector<HoleCoverageLink> coverage = compute_coverage(holes, lines)
		| views::transform([&](const auto& hcl){
			const auto& [h,from,to,suppressed]=hcl;
			return HoleCoverageLink{
				.h=h+n,
				.from=from,
				.to=to,
				.suppressed=suppressed
			};
		}) | ranges::to<vector>();

//TODO: views::join_with
	string cov_json = coverage
		| views::transform([&](const HoleCoverageLink& hcl){
                        const auto [h,from,to,suppressed] = hcl;
                        return format(R"({{"h":{},"from":{},"to":{},"suppressed":{}}},)",h,from,to,suppressed);
                }) | views::join
                | ranges::to<string>();
        if (cov_json.empty()==false)
                cov_json.pop_back();
        printf("cov=[%s]\n", cov_json.c_str());


	vector<RectDimRank> instability_excluding_holes = compute_instability(rectangles, {}/*holes*/, links);
	vector<RectDimRank> instability_including_holes = compute_instability(rectangles, holes, {}/*links*/);

	printf("ieh.size()=%zu\n", instability_excluding_holes.size());

	auto proj1 = [&](const RectDimRank& rectdim_rank){
		const auto& [rec,rectdim,rank,gap,_,_,_]=rectdim_rank;
		return make_tuple(rec,rank,abs(gap));
	};
	ranges::sort(instability_including_holes, {}, proj1);
	const vector<RectDimRank> filtered_instability_including_holes = instability_including_holes
		| views::chunk_by([&](const RectDimRank& rk1, const RectDimRank& rk2){
			return rk1.rec != rk2.rec;
		}) | views::transform([](const auto& chunk){
			return chunk[0];
		}) | views::filter([&](const RectDimRank& rectdim_rank){
			const auto& [rec, rectdim, rank, gap, hole_cardinality, rect_cardinality, link_count]=rectdim_rank;
			const MyRect& h = v[rec];
			return rec >= n &&
				width(h) >= 40 && height(h) >= 40 &&
				rank==0 && hole_cardinality >=3 && rect_cardinality<=1 && abs(gap)>20;
		}) | ranges::to<vector>();

	auto proj2 = [&](const RectDimRank& rectdim_rank){
		const auto& [rec,rectdim,rank,gap,_,_,_]=rectdim_rank;
		return make_tuple(rec,rank,-abs(gap));
	};

	ranges::sort(instability_excluding_holes, {}, proj2);
	auto filtered_instability_excluding_holes_ = instability_excluding_holes
		| views::chunk_by([](const RectDimRank& rk1, const RectDimRank& rk2){
			return rk1.rec == rk2.rec;
		}) | views::transform([](const auto& chunk){
			return chunk[0];
		}) | views::filter([&](const RectDimRank& rectdim_rank){
			const auto& [rec, rectdim, rank, gap, hole_cardinality, rect_cardinality, link_count]=rectdim_rank;
			return abs(gap)>20 &&
				((link_count==1 && rank==0 && rect_cardinality<=2) ||
				 (link_count==2 && rank==1 && rect_cardinality==1));
		});

	int nn = ranges::distance(filtered_instability_excluding_holes_);
	printf("fieh_.size()=%d\n", nn);

	const vector<RectDimRank> filtered_instability_excluding_holes = filtered_instability_excluding_holes_
		| views::filter([&](const RectDimRank& rectdim_rank){
			const auto& [rec, rectdim, rank, gap, hole_cardinality, rect_cardinality, link_count]=rectdim_rank;
			auto rg = filtered_instability_excluding_holes_
				| views::filter([&](const RectDimRank& rk){
					return rk.rank==0 && rk.rectdim==rectdim && rk.rect_cardinality==1;
				});
			return rank==0 || (rank==1 && ranges::empty(rg)==false);
		}) | ranges::to<vector>();

	printf("fieh.size()=%zu\n", filtered_instability_excluding_holes.size());

//TODO: views::join_with
	string json = filtered_instability_excluding_holes
		| views::transform([&](const RectDimRank& rectdim_rank){
			const auto [rec, rectdim, rank, gap, hole_cardinality, rect_cardinality, link_count] = rectdim_rank;
			return format(R"({{"rec":{},"rectdim":"{}","rank":{},"gap":{},"hole_cardinality":{},"rect_cardinality":{},"link_count":{}}},)",
					rec, RectDimString[rectdim], rank, gap, hole_cardinality, rect_cardinality, link_count);
		}) | views::join
		| ranges::to<string>();
	if (json.empty()==false)
		json.pop_back();
	printf("fieh=[%s]\n", json.c_str());

	const vector<tuple<Edge,NeighborDegree> > multi_degree_neighbors = compute_multi_degree_neighbors(rectangles, holes);

	enum Stability
	{
		STABLE,
		UNSTABLE
	};

	vector<tuple<Edge,NeighborDegree> > multi_degree_neighbor_data = multi_degree_neighbors;

	vector<tuple<MyRect, Stability> > rec_data = v
		| views::transform([](const MyRect& r){return make_tuple(r,STABLE);})
		| ranges::to<vector>();

	for (const RectDimRank &rectdim_rank : filtered_instability_excluding_holes)
	{
		auto& [r,stability] = rec_data[rectdim_rank.rec];
		stability = UNSTABLE;
	}

	vector<HoleCoverageLink> coverage_data = coverage;

	auto build_children=[&](int parent){
		const auto rec_tensor = mdspan(rec_data.data(), rec_data.size() / v.size(), v.size());
		const auto multi_degree_neighbor_tensor = mdspan(multi_degree_neighbor_data.data(),
							multi_degree_neighbor_data.size() / multi_degree_neighbors.size(),
							multi_degree_neighbors.size());

		const int mm = multi_degree_neighbors.size();
		auto multi_degree_neighbors_ = views::iota(0, mm)
			| views::transform([&](int i){return multi_degree_neighbor_tensor[parent,i];});

		auto rg = filtered_instability_excluding_holes
//TODO: generator, ranges::elements_of
			| views::transform([&](const RectDimRank& rk){
				const vector vec = ranges::equal_range(links, rk.rec, {}, &Edge::from)
					| views::transform([&](const Edge& lk){
						const auto& [ri/*from*/, pi/*to*/] = lk;
						const auto& [rec, rec_stability] = rec_tensor[parent, ri];
						const auto& [pivot, pivot_stability] = rec_tensor[parent, pi];

						auto proj=[](const tuple<Edge,NeighborDegree>& neighbor){
							const auto& [e,degree]=neighbor;
							return e.from;
						};
						auto rg = ranges::equal_range(multi_degree_neighbors_, pi, {}, proj)
							| views::filter([&](const tuple<Edge,NeighborDegree>& neighbor){
								const auto& [e2, degree] = neighbor;
								const auto& [pi_/*from*/,hi/*to*/] = e2;
								const auto& [hole, hole_stability] = rec_tensor[parent, hi];
								assert(pi==pi_);
								return degree==FIRST_DEGREE_NEIGHBOR &&
//demand side: select a rectangle that is not stable and which has a link to a stable rectangle called pivot
									rec_stability==UNSTABLE && ri<n && pi<n && pivot_stability==STABLE &&
//supply side: select a hole which is a neighbor of a stable rectangle called pivot
									hole_stability==STABLE && hi>=n;
							}) | views::transform([&](const tuple<Edge,NeighborDegree>& neighbor){
								return make_tuple(rk, lk, neighbor);
							}) | ranges::to<vector>();

						return rg;
						//co_yield ranges::elements_of(rg);
						//return vector(begin(rg), end(rg));
					}) | views::join
					| ranges::to<vector>();

				//co_yield ranges::elements_of(rg);
				//return vector(begin(rg), end(rg));
				return vec;
			}) | views::join
			| views::filter([&](const auto& arg){
//check if the neighbor hole is covered by any link not connected to rk.rec. If there is such a link, stop considering it.
				const auto& [rk, lk, neighbor] = arg;
				const auto& [e2, degree] = neighbor;
				const auto& [pivot/*from*/, hole/*to*/] = e2;
				const Edge ed_frd = {.from=pivot,.to=rk.rec};
				const Edge ed_rev = {.from=rk.rec, .to=pivot};

				auto pred=[&](const HoleCoverageLink& hcl){
					const Edge e = {.from=hcl.from,.to=hcl.to};
					return hcl.h==hole && e!=ed_frd && e!=ed_rev;
				};
				auto rg = views::iota(0,(int)coverage.size())
					| views::transform([&](int i){
//created here to avoid possibility of division by zero
						const auto coverage_tensor = mdspan(coverage_data.data(),
							coverage_data.size() / coverage.size(),
							coverage.size());
						return coverage_tensor[parent,i];
					});
				auto cov = ranges::equal_range(rg, hole, {}, &HoleCoverageLink::h)
					| views::filter([](const HoleCoverageLink& hcl){return hcl.suppressed==false;});

				printf("hole=%d\n", hole);
//TODO: views::join_with
				const string buf = cov | views::transform([](const auto& arg){
					const auto& [h,from,to,suppressed] = arg;
					return format("{{h:{},from:{},to:{},suppressed:{}}}",h,from,to,suppressed);
				}) | views::join
				| ranges::to<string>();
				printf("cov:[%s]\n", buf.c_str());
				const bool b = ranges::none_of(cov, pred);
				printf("ranges::none_of(cov, pred)=%s\n", b ? "true" : "false");

				return ranges::none_of(cov, pred);
			});

//TODO: views::join_with
		string json2 = rg
			| views::transform([&](const auto& arg){
				const auto& [rk, lk, neighbor] = arg;
				const auto& [rec, rectdim, rank, gap, hole_cardinality, rect_cardinality, link_count] = rk;
				const string json_rk = format(R"({{"rec":{},"rectdim":"{}","rank":{},"gap":{},"hole_cardinality":{},"rect_cardinality":{},"link_count":{}}})",
					rec, RectDimString[rectdim], rank, gap, hole_cardinality, rect_cardinality, link_count);
				const string json_lk = format(R"({{"from":{},"to":{}}})", lk.from, lk.to);
				const auto& [e, degree]=neighbor;
				const string json_neighbor = format(R"({{"from":{},"to":{},"degree":{}}})",
								e.from,e.to,NeighborDegreeString[degree]);
				return format(R"({{"rk":{},"lk":{},"neighbor":{}}},)",json_rk,json_lk,json_neighbor);
			}) | views::join
                	| ranges::to<string>();
		if (json2.empty()==false)
        		json2.pop_back();
        	printf("pivots=[%s]\n", json2.c_str());

		const vector children = rg | views::transform([&](const auto& arg){

			const auto& [rk, lk, neighbor] = arg;

//demand side: select a rectangle that is not stable and which has a link to a stable rectangle called pivot
			const auto& [ri/*from*/, pi/*to*/] = lk;
			const auto& [rec, rec_stability] = rec_tensor[parent, ri];
			const auto& [pivot, pivot_stability] = rec_tensor[parent, pi];
			assert(rec_stability==UNSTABLE);
			assert(ri<n);
			assert(pi<n);
			assert(pivot_stability==STABLE);
			assert(rec_stability==UNSTABLE && ri<n && pi<n && pivot_stability==STABLE);
//supply side: select a hole which has one connection to a stable rectangle called pivot
			const auto& [e2, degree_] = neighbor;
			const auto& [pi_/*from*/, hi/*to*/] = e2;
			const auto& [hole, hole_stability] = rec_tensor[parent, hi];
			const auto& [pivot_, pivot_stability_] = rec_tensor[parent, pi];
			assert(hole_stability==STABLE && hi>=n && pi<n && pivot_stability==STABLE);
			assert(pi == pi_);

			const int m = v.size();
			vector<tuple<MyRect, Stability> > node = views::iota(0, m)
				| views::transform([&](int i){return rec_tensor[parent,i];})
				| ranges::to<vector>();

			swap(node[ri], node[hi]);
			const auto [r,_/*rec_stability*/]=node[ri];
			node[ri]={r,STABLE};
			const auto [h,_/*hole_stability*/]=node[hi];
			node[hi]={h,UNSTABLE};

			auto permute=[&](int i){
				if (i == ri)
					return hi;
				else if (i == hi)
					return ri;
				else
					return i;
			};

			const int mm = multi_degree_neighbors.size();
			const vector<tuple<Edge,NeighborDegree> > multi_degree_neighbors_ = views::iota(0, mm)
				| views::transform([&](int i){
					const auto& [e,degree] = multi_degree_neighbor_tensor[parent,i];
					const Edge ee{
						.from = permute(e.from),
						.to = permute(e.to)
					};
					return make_tuple(ee,degree);
				}) | ranges::to<set>()	//sort. TODO: flat_set
				| ranges::to<vector>();

			const vector<HoleCoverageLink> coverage_ = views::iota(0, (int)coverage.size())
				| views::transform([&](int i){
//created here to avoid possibility of division by zero.
					const auto coverage_tensor = mdspan(coverage_data.data(),
						coverage_data.size() / coverage.size(),
						coverage.size());
					const auto& [h,from,to,suppressed] = coverage_tensor[parent,i];
					return HoleCoverageLink{
						.h=h,
						.from=from,
						.to=to,
						.suppressed=suppressed || h==hi
					};
				}) | ranges::to<vector>();

/*TODO: can this work ?
return make_tuple(ranges::elements_from(node), ranges::elements_from(multi_degree_neighbors_, ranges::elements_from(coverage_))
*/
			return make_tuple(node, multi_degree_neighbors_, coverage_);
		}) | ranges::to<vector>();

		const vector<tuple<MyRect,Stability> > rects = children
			| views::elements<0>
			| views::join
			| ranges::to<vector>();

		const vector<tuple<Edge,NeighborDegree> > multi_degree_neighbors = children
			| views::elements<1>
			| views::join
			| ranges::to<vector>();

		const vector<HoleCoverageLink> coverage = children
			| views::elements<2>
			| views::join
			| ranges::to<vector>();

		return make_tuple(rects,multi_degree_neighbors,coverage);
	};

	int size = 0;

	while (size < rec_data.size() / v.size())
	{
		const int start_size = rec_data.size() / v.size();
		while (size < start_size)
		{
			const auto [rects, multi_degree_neighbors, coverage] = build_children(size++);
//TODO: views::concat
			auto il1 = {rec_data, rects};
			rec_data = il1 | views::join | ranges::to<vector>();
//TODO: views::concat
			auto il2 = {multi_degree_neighbor_data, multi_degree_neighbors};
			multi_degree_neighbor_data = il2 | views::join | ranges::to<vector>();
//TODO: views::concat
			auto il3 = {coverage_data, coverage};
			coverage_data = il3 | views::join | ranges::to<vector>();
		}
	}

	const int rd_size = rec_data.size() / v.size();
	printf("tree_size=%d\n", rd_size);

	const auto rec_tensor = mdspan(rec_data.data(), rec_data.size() / v.size(), v.size());

	const auto multi_degree_neighbor_tensor = mdspan(multi_degree_neighbor_data.data(),
						multi_degree_neighbor_data.size() / multi_degree_neighbors.size(),
						multi_degree_neighbors.size());
	auto diff=[&](int version1, int version2){

		const int v_size = v.size();

		auto f=[&](int version){
			return views::iota(0, v_size)
				| views::transform([&](int i){
					const auto& [r,stability] = rec_tensor[version, i];
					return make_tuple(r,i);
				}) | ranges::to<set>();  //sort. TODO: flat_set
		};

		const vector<tuple<int,int> > moves = views::zip(f(version1), f(version2))
			| views::transform([](const auto& arg){
				const auto& [a, b] = arg;
				const auto& [ri, i] = a;
				const auto& [rj, j] = b;
				assert(ri == rj);
				return make_tuple(i, j);
			}) | views::filter([](const auto& arg){
				const auto& [i, j]= arg;
				return i != j;
			}) | views::filter([&](const auto& arg){
				const auto& [hi,ri]=arg;
				return ri < n && hi >= n;
			}) | ranges::to<vector>();

		return moves;
	};

	struct DiagramFeature{
		int frame_diameter;
		int sigma_edge_degree;
		float sigma_edge_length;
		float max_fit_penalty;
	};

	const int mm = multi_degree_neighbors.size();

	const vector<DiagramFeature> features = views::iota(0,rd_size)
		| views::transform([&](int j){
			auto multi_degree_neighbors_ = views::iota(0, mm)
				| views::transform([&](int i){return multi_degree_neighbor_tensor[j,i];});

			auto proj=[&](int i){const auto& [r,stability]=rec_tensor[j,i];return r;};
			auto rects = views::iota(0, n)
				| views::transform(proj);
			const MyRect frame = {
				.m_left = ranges::min(rects | views::transform(&MyRect::m_left)),
				.m_right = ranges::max(rects | views::transform(&MyRect::m_right)),
				.m_top = ranges::min(rects | views::transform(&MyRect::m_top)),
				.m_bottom = ranges::max(rects | views::transform(&MyRect::m_bottom))
			};
			const int x = width(frame), y = height(frame);
			const int diameter = sqrt(x*x + y*y);

			auto rg = links
				| views::transform([&](const Edge& e){
					auto proj=[](const auto& arg){const auto& [e,degree]=arg;return e;};
					auto rg = ranges::equal_range(multi_degree_neighbors_, e, {}, proj);
					auto [_/*e*/,degree] = rg[0];
					return degree;
				});
			const int sigma_edge_degree = ranges::fold_left(rg, 0, plus<int>());

			auto rg2 = links
				| views::transform([&](const Edge& e){
					return rect_distance(rects[e.from], rects[e.to]);
				});
			const float sigma_edge_length = ranges::fold_left(rg2, 0, plus<float>());

			auto rg3 = diff(0,j)
				| views::transform([&](const auto& arg){
//at location ri, r1 has been replaced by r2. If it has been shrunk, we want to apply a penalty
					const auto& [hi,ri]=arg;
					const auto &[r1,_/*stability*/] = rec_tensor[0,ri];
					const auto &[r2,_/*stability*/] = rec_tensor[0,hi];
					return std::min<float>({1.0f * width(r2) / width(r1), 1.0f * height(r2) / height(r1), 1});
				});
			const float min_fit_ratio = ranges::empty(rg3) ? 1 : ranges::min(rg3);

			return DiagramFeature{
				.frame_diameter=diameter,
				.sigma_edge_degree=sigma_edge_degree,
				.sigma_edge_length=sigma_edge_length,
				.max_fit_penalty=1 - min_fit_ratio
			};
		}) | ranges::to<vector>();

	const auto [min_x1, max_x1] = ranges::minmax(features | views::transform(&DiagramFeature::frame_diameter));
	const auto [min_x2, max_x2] = ranges::minmax(features | views::transform(&DiagramFeature::sigma_edge_degree));
        const auto [min_x3, max_x3] = ranges::minmax(features | views::transform(&DiagramFeature::sigma_edge_length));
//	const auto [min_x4, max_x4] = ranges::minmax(features | views::transform(&DiagramFeature::max_fit_penalty));

	const vector<array<float,4> > normalized_features = features
		| views::transform([&](const DiagramFeature& feature){
			const auto& [x1, x2, x3, x4] = feature;
			const array<float,4> normalized = {
				min_x1 == max_x1 ? 0.0f : 1.0f*(x1 - min_x1)/(max_x1 - min_x1),
				min_x2 == max_x2 ? 0.0f : 1.0f*(x2 - min_x2)/(max_x2 - min_x2),
				min_x3 == max_x3 ? 0.0f : 1.0f*(x3 - min_x3)/(max_x3 - min_x3),
				x4/* == max_x4 ? 0.0f : 1.0f*(x4 - min_x4)/(max_x4 - min_x4)*/
			};
			return normalized;
		}) | ranges::to<vector>();

	const int m = rec_data.size() / v.size();
	vector<int> ranking = views::iota(0,m) | ranges::to<vector>();
	auto proj = [&](int i){
		const auto& [x1, x2, x3, x4] = normalized_features[i];
		return x1 + x2 + x3 + x4;
	};
	ranges::sort(ranking, {}, proj);

	const int best = ranking[0];
	printf("best=%d\n", best);

	for (int i : {0, best})
	{
		const auto [frame_diameter, sigma_edge_degree, sigma_edge_length, max_fit_penalty] = features[i];
		printf("feature[%d]={frame_diameter=%d, sigma_edge_degree=%d, sigma_edge_length=%.2f, max_fit_penalty=%.2f}\n",
			i, frame_diameter, sigma_edge_degree, sigma_edge_length, max_fit_penalty);
		const auto [x1, x2, x3, x4] = normalized_features[i];
		printf("normalized_feature[%d]={x1=%.2f,x2=%.2f,x3=%.2f,x4=%.2f}\n", i, x1, x2, x3, x4);
	}

	const vector<tuple<int,int,MyRect,MyRect> > moves = diff(0,best)
		| views::transform([&](const auto& arg){
			const auto& [i, j] = arg;
			const auto& [h,_/*stability*/] = rec_tensor[0,i];
			const auto& [r,_/*stability*/] = rec_tensor[0,j];
			return make_tuple(i,j,r,h);
		}) | ranges::to<vector>();

	return moves;
}

vector<tuple<int, Edge> > compute_move_scores(const vector<MyRect> &rectangles, const vector<MyRect> &holes, const vector<Edge> &edges)
{
	const vector<Edge> first_degree_neighbors = compute_neighbors(rectangles, holes);
	const vector<Edge> second_degree_neighbors = compute_second_degree_neighbors(rectangles, holes);
	const vector<Edge> third_degree_neighbors = compute_third_degree_neighbors(rectangles, holes);

	const vector<Edge> degree_neighbors3[3]={
		first_degree_neighbors,
		second_degree_neighbors,
		third_degree_neighbors
	};

//TODO: generator, elements_of, flat_set, views::enumerate
	const vector<tuple<Edge,NeighborDegree> > multi_degree_neighbors = span(degree_neighbors3, 3)
		| views::transform([&](const vector<Edge>& degree_neighbors){
			NeighborDegree degree = (NeighborDegree) std::distance(degree_neighbors3, &degree_neighbors);
			auto rg = degree_neighbors | views::transform([&](const Edge& e){return make_tuple(e, degree);});
			//co_yield ranges::elements_of(rg);
			return vector(begin(rg), end(rg));
		}) | views::join
		| ranges::to<set>()
		| ranges::to<vector>();

	const vector<tuple<int, Edge> > move_scores = first_degree_neighbors
		| views::transform([&](const Edge& e){
		// what if we try to move e.from to e.to

		// for n in {e.to,e.from}, look if adj(edges,e.from) are among the neighbors of n.
		// would a move be worth it ?
			auto node_score=[&](int n){
				auto multi_degree_neighbor = adj(multi_degree_neighbors, n);
				auto score = adj(edges,e.from)
					| views::transform([&](int i){
						auto proj=[](auto arg){auto [to,degree]=arg; return to;};
						auto rg = ranges::equal_range(multi_degree_neighbor, i, {}, proj);
						if (ranges::empty(rg))
							return 3;
						auto [to,degree]=rg[0];
						return (int)degree;
					});
				int total_score = ranges::fold_left(score, 0, plus<int>());
				return total_score;
			};
			return make_tuple(node_score(e.to) - node_score(e.from), e);
		}) | ranges::to<set>() //sort. TODO: flat_set
		| ranges::to<vector>() ;

	return move_scores;
}


vector<tuple<int,int,MyRect,MyRect> > query_crossings(const vector<MyRect> &rectangles, const vector<Edge> &links)
{
	const vector<tuple<Edge,NeighborDegree> > multi_degree_neighbors = compute_multi_degree_neighbors(rectangles);

	struct DiagramFeature{
		int sigma_edge_degree;
		float sigma_edge_length;
		float fit_penalty;
	};

//TODO: views::concat(), views::single()
	auto il = {{make_tuple(Edge{.from=-1,.to=-1},FIRST_DEGREE_NEIGHBOR)}, multi_degree_neighbors};

	const vector<Edge> permutations = il
		| views::join
		| views::filter([](const auto& neighbor){
			auto& [e,degree]=neighbor;
			return degree == FIRST_DEGREE_NEIGHBOR &&
				e.from <= e.to;
		}) | views::elements<0>
		| ranges::to<vector>() ;

	const vector<DiagramFeature> features = permutations
                | views::transform([&](const Edge& e){
			const auto& [from,to]=e;
			printf("permute:{from:%d,to:%d}\n", from, to);
			auto permute=[&](int k){
				if (k==from)
					return to;
				else if (k==to)
					return from;
				else
					return k;
			};
			auto permute_edge=[&](const Edge& e){
				return Edge{.from=permute(e.from),.to=permute(e.to)};
			};

			auto rg1 = links
				| views::transform(permute_edge)
				| views::transform([&](const auto& lk){
					auto proj = [](const tuple<Edge,NeighborDegree>& neighbor){
						const auto& [e,degree]=neighbor;
						return e;
					};
					auto rg = ranges::equal_range(multi_degree_neighbors, lk, {}, proj);
					if (ranges::empty(rg) == false)
					{
						const auto& [e,degree]=rg[0];
						return (int)degree;
					}
					else
					{
						return 4;
					};
				});

			const int sigma_edge_degree = ranges::fold_left(rg1, 0, plus<int>());
			auto rg2 = links
				| views::transform(permute_edge)
				| views::transform([&](const Edge& e){
					return rect_distance(rectangles[e.from], rectangles[e.to]);
				});
			const float sigma_edge_length = ranges::fold_left(rg2, 0, plus<float>());
//r1 and r2 have been swapped. If the size does not fit, we want to apply a penalty
			const MyRect& r1 = rectangles[from];
			const MyRect& r2 = rectangles[to];
			const float a = std::min<float>({
				1.0f * width(r2) / width(r1),
				1.0f * width(r1) / width(r2),
				1.0f * height(r2) / height(r1),
				1.0f * height(r1) / height(r2)
			});
			return DiagramFeature{
				.sigma_edge_degree=sigma_edge_degree,
				.sigma_edge_length=sigma_edge_length,
				.fit_penalty=1-a
			};
		}) | ranges::to<vector>();

	const auto [min_x1, max_x1] = ranges::minmax(features | views::transform(&DiagramFeature::sigma_edge_degree));
        const auto [min_x2, max_x2] = ranges::minmax(features | views::transform(&DiagramFeature::sigma_edge_length));
//	const auto [min_x3, max_x3] = ranges::minmax(features | views::transform(&DiagramFeature::fit_penalty));

	const vector<array<float,3> > normalized_features = features
		| views::transform([&](const DiagramFeature& feature){
			const auto& [x1, x2, x3] = feature;
			const array<float,3> normalized = {
				min_x1 == max_x1 ? 0.0f : 1.0f*(x1 - min_x1)/(max_x1 - min_x1),
				min_x2 == max_x2 ? 0.0f : 1.0f*(x2 - min_x2)/(max_x2 - min_x2),
				x3
			};
			return normalized;
		}) | ranges::to<vector>();

	const int n = normalized_features.size();
	vector<int> ranking = views::iota(0,n) | ranges::to<vector>();
	auto proj = [&](int i){
		const auto& [x1, x2, x3] = normalized_features[i];
		return make_tuple(x1 + x2 /*+ x3*/, i);
	};
	ranges::sort(ranking, {}, proj);

//TODO: views::join_with
	const string json = ranking
		| views::transform([&](int i){
			const auto& [from, to] = permutations[i];
			const auto& [x1,x2,x3] = normalized_features[i];
			return format(R"({{"from":{},"to":{},"x1":{:.2},"x2":{:.2},"x3":{:.2}}},)",from,to,x1,x2,x3);
		}) | views::join
		| ranges::to<string>();
	printf("ranking=[%s]\n", json.c_str());

	const int best = ranking[0];
	printf("best=%d\n", best);

	if (best == 0)
	{
		return {};
	}
	else
	{
		const auto& [from, to] = permutations[best];
		return {
			make_tuple(from, to, rectangles[from], rectangles[to]),
			make_tuple(to, from, rectangles[to], rectangles[from])
		};
	}
}

//interface for emscripten wasm
extern "C" {

static char res[100000];

const char* compact(const char* update_direction_string, const char* slinks, const char* srects)
{
	const vector<MyRect> input_rectangles = str2rects(srects);
	vector<MyRect> rectangles = input_rectangles;
	const vector<Edge> edges = str2links(slinks)
		| views::transform([](auto lk){return array{Edge{lk.from,lk.to},Edge{lk.to,lk.from}};})
		| views::join
		| ranges::to<set>()
		| ranges::to<vector>() ;
	const Direction update_direction = *(
		directions
		| views::filter([&](Direction dir){return DirectionString[dir]==update_direction_string;})
	).begin();
	const vector<RectLink> rect_links = sweep(update_direction, rectangles);
	compact(update_direction, rect_links, edges, input_rectangles, rectangles);
	return 0;
}

const char* compute_instability(const char* rects, const char* trous, const char* slinks)
{
	const vector<MyRect> rectangles = str2rects(rects);
	const vector<MyRect> holes = str2rects(trous);
        const vector<Edge> links = str2links(slinks)
                | views::transform([](auto lk){return array{Edge{lk.from,lk.to},Edge{lk.to,lk.from}};})
                | views::join
                | ranges::to<set>()
                | ranges::to<vector>() ;

	printf_("rectangles.size()=%zu\n", rectangles.size());
	printf_("holes.size()=%zu\n", holes.size());
	printf_("links.size()=%zu\n", links.size());

	const vector<RectDimRank> instability = compute_instability(rectangles, holes, links);

	const int n = instability.size();
//TODO: views::join_with
	string json = instability
		| views::transform([&](const RectDimRank& rectdim_rank){
			const auto [rec, rectdim, rank, gap, hole_cardinality, rect_cardinality, link_count] = rectdim_rank;
			return format(R"({{"rec":{},"rectdim":"{}","rank":{},"gap":{},"hole_cardinality":{},"rect_cardinality":{},"link_count":{}}},)",
						rec, RectDimString[rectdim], rank, gap, hole_cardinality, rect_cardinality, link_count);
		}) | views::join
		| ranges::to<string>();

	json.pop_back();

	sprintf(res, "[%s]", json.c_str());
	return res;
}

const char* sigma_segment_length(const char* segments)
{
	const vector<Line> lines = str2lines(segments);
	printf_("lines.size()=%zu\n", lines.size());
	int n = sigma_segment_length(lines);
        sprintf(res, R"({"sigma":%d})", n);
        return res;
}

const char* count_segment_crossings(const char* segments)
{
	const vector<Line> lines = str2lines(segments);
	printf_("lines.size()=%zu\n", lines.size());
	int n = count_segment_crossings(lines);
	sprintf(res, R"({"count":%d})", n);
	return res;
}

const char* compute_coverage(const char* trous, const char* segments)
{
	const vector<MyRect> holes = str2rects(trous);
	const vector<Line> lines = str2lines(segments);

	printf_("holes.size()=%zu\n", holes.size());
	printf_("lines.size()=%zu\n", lines.size());

	const vector<HoleCoverageLink> links = compute_coverage(holes, lines);

	printf_("links.size()=%zu\n", links.size());

//TODO: views::join_with
	string json = links
		| views::transform([](const HoleCoverageLink& lk){return format(R"({{"h":{},"from":{},"to":{}}},)", lk.h,lk.from,lk.to);})
		| views::join
		| ranges::to<string>();

	json.pop_back();
	sprintf(res, "[%s]", json.c_str());
	return res;
}

const char* query_crossings(const char *rects, const char *slinks)
{
	const vector<MyRect> rectangles = str2rects(rects);
	const vector<Edge> links = str2links(slinks);
	vector<tuple<int,int,MyRect,MyRect> > moves = query_crossings(rectangles, links);
//TODO: views::join_with

	string json = moves
		| views::transform([](const auto &arg){
			const auto& [i,j,ri,rj] = arg;
			return format(R"({{"i":{},"j":{},"ri":{{"left":{},"right":{},"top":{},"bottom":{}}},"rj":{{"left":{},"right":{},"top":{},"bottom":{}}}}},)",
				i, j,
				ri.m_left, ri.m_right, ri.m_top, ri.m_bottom,
				rj.m_left, rj.m_right, rj.m_top, rj.m_bottom);
		}) | views::join
		| ranges::to<string>();

	if (json.empty()==false)
		json.pop_back();

	sprintf(res, "[%s]", json.c_str());
	return res;
}

const char* optimize_layout(const char *rects, const char *slinks, const char* segments)
{
	const vector<MyRect> rectangles = str2rects(rects);
	const vector<Edge> links = str2links(slinks)
		| views::transform([](auto lk){
			return array{Edge{lk.from,lk.to},Edge{lk.to,lk.from}};
		}) | views::join
		| ranges::to<set>()
		| ranges::to<vector>() ;
	const vector<Line> lines = str2lines(segments);

	const vector<tuple<int,int,MyRect,MyRect> > moves = optimize_layout(rectangles, links, lines);

//TODO: views::join_with

	string json = moves
		| views::transform([](const auto &arg){
			const auto& [i,j,ri,rj] = arg;
			return format(R"({{"i":{},"j":{},"ri":{{"left":{},"right":{},"top":{},"bottom":{}}},"rj":{{"left":{},"right":{},"top":{},"bottom":{}}}}},)",
				i, j,
				ri.m_left, ri.m_right, ri.m_top, ri.m_bottom,
				rj.m_left, rj.m_right, rj.m_top, rj.m_bottom);
		}) | views::join
		| ranges::to<string>();

	if (json.empty()==false)
		json.pop_back();
	sprintf(res, "[%s]", json.c_str());

	return res;
}

const char* compute_move_scores(const char *rects, const char *trous, const char *slinks)
{
	const vector<MyRect> rectangles = str2rects(rects),
				holes = str2rects(trous);
	const vector<Edge> links = str2links(slinks)
		| views::transform([](auto lk){return array{Edge{lk.from,lk.to},Edge{lk.to,lk.from}};})
		| views::join
		| ranges::to<set>()
		| ranges::to<vector>() ;

	const vector<tuple<int, Edge> > result = compute_move_scores(rectangles, holes, links);

//TODO: views::join_with
	string json = result
		| views::transform([](const auto &arg){
			const auto& [score, e] = arg;
			return format(R"({{"from":{},"to":{},"score":{}}},)", e.from, e.to, score);
		}) | views::join
		| ranges::to<string>();

	json.pop_back();
	sprintf(res, "[%s]", json.c_str());
	return res;
}

const char* compute_second_degree_neighbors(const char *rects, const char *trous)
{
	const vector<MyRect> rectangles = str2rects(rects),
				holes = str2rects(trous);

	printf_("rectangles.size()=%zu\n", rectangles.size());
	printf_("holes.size()=%zu\n", holes.size());

	const vector<Edge> edges = compute_second_degree_neighbors(rectangles, holes);

//TODO: views::join_with
	string json = edges
		| views::transform([](const Edge &e){return format(R"({{"from":{},"to":{}}},)", e.from, e.to);})
		| views::join
		| ranges::to<string>();

	json.pop_back();
	sprintf(res, "[%s]", json.c_str());
	return res;
}

const char* compute_neighbors(const char *rects, const char *trous)
{
	const vector<MyRect> rectangles = str2rects(rects),
				holes = str2rects(trous);

	printf_("rectangles.size()=%zu\n", rectangles.size());
	printf_("holes.size()=%zu\n", holes.size());

	const vector<Edge> edges = compute_neighbors(rectangles, holes);

//TODO: views::join_with
	string json = edges
		| views::transform([](const Edge &e){return format(R"({{"from":{},"to":{}}},)", e.from, e.to);})
		| views::join
		| ranges::to<string>();

	json.pop_back();
	sprintf(res, "[%s]", json.c_str());
	return res;
}

const char* compute_holes(const char *rects)
{
	const vector<MyRect> rectangles = str2rects(rects);
	printf_("rectangles.size()=%zu\n", rectangles.size());

	const vector<MyRect> holes = compute_holes(rectangles);

//TODO: views::join_with(",\n"s)
//TODO: json can be const string
	string json = holes
		| views::transform([](const MyRect& r){
                        return format(R"({{"left":{},"right":{},"top":{},"bottom":{}}},)",
					r.m_left, r.m_right, r.m_top, r.m_bottom);
				})
		| views::join
		| ranges::to<string>() ;

	json.pop_back();

	sprintf(res, "[%s]", json.c_str());
        return res;
}

const char* compute_holes_with_border(const char *rects)
{
	const vector<MyRect> rectangles = str2rects(rects);
	printf_("rectangles.size()=%zu\n", rectangles.size());

	const vector<MyRect> holes = compute_holes_with_border(rectangles);

//TODO: views::join_with(",\n"s)
//TODO: json can be const string
	string json = holes
		| views::transform([](const MyRect& r){
                        return format(R"({{"left":{},"right":{},"top":{},"bottom":{}}},)",
					r.m_left, r.m_right, r.m_top, r.m_bottom);
				})
		| views::join
		| ranges::to<string>() ;

	json.pop_back();

	sprintf(res, "[%s]", json.c_str());
        return res;
}

}

int main(int argc, char* argv[])
{
	const char *rects = "";
	const char* holes = compute_holes(rects);
	printf("%s",holes);
}

//emcc sweep.cpp -o sweep.js -std=c++26 -Wno-c++11-narrowing -s EXPORTED_FUNCTIONS='["_optimize_layout","_compute_move_scores","_compact","_sigma_segment_length","_count_segment_crossings","_compute_instability","_compute_coverage","_query_crossings","_compute_neighbors","_compute_second_degree_neighbors","_compute_holes","_compute_holes_with_border"]' -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' -s ALLOW_MEMORY_GROWTH=1  -s EXPORT_ES6=1 -s MODULARIZE=1 -s EXPORT_NAME="createSweepModule" -s TOTAL_STACK=32MB
