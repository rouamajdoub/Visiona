<mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />
    
    <!-- User (classe parente) -->
    <mxCell id="user" value="&lt;p style=&quot;margin:0px;margin-top:4px;text-align:center;&quot;&gt;&lt;b&gt;User&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ _id: String&lt;br&gt;+ email: String&lt;br&gt;+ password: String&lt;br&gt;+ firstName: String&lt;br&gt;+ lastName: String&lt;br&gt;+ role: String&lt;br&gt;+ createdAt: Date&lt;br&gt;+ updatedAt: Date&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;" parent="1" vertex="1">
      <mxGeometry x="320" y="40" width="200" height="140" as="geometry" />
    </mxCell>
    
    <!-- Architect -->
    <mxCell id="architect" value="&lt;p style=&quot;margin:0px;margin-top:4px;text-align:center;&quot;&gt;&lt;b&gt;Architect&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ status: String {pending, approved, rejected}&lt;br&gt;+ patenteFile: String&lt;br&gt;+ cinFile: String&lt;br&gt;+ bio: String&lt;br&gt;+ companyName: String&lt;br&gt;+ experienceYears: Number&lt;br&gt;+ specialization: String[]&lt;br&gt;+ isVerified: Boolean&lt;br&gt;+ portfolio: String[]&lt;br&gt;+ subscriptionType: String&lt;br&gt;+ clientsCount: Number&lt;br&gt;+ isActive: Boolean&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;" parent="1" vertex="1">
      <mxGeometry x="120" y="240" width="250" height="200" as="geometry" />
    </mxCell>
    
    <!-- Client -->
    <mxCell id="client" value="&lt;p style=&quot;margin:0px;margin-top:4px;text-align:center;&quot;&gt;&lt;b&gt;Client&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ projects: ObjectId[]&lt;br&gt;+ reviews: ObjectId[]&lt;br&gt;+ isActive: Boolean&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;" parent="1" vertex="1">
      <mxGeometry x="450" y="240" width="180" height="80" as="geometry" />
    </mxCell>
    
    <!-- ArchitectClient -->
    <mxCell id="architectClient" value="&lt;p style=&quot;margin:0px;margin-top:4px;text-align:center;&quot;&gt;&lt;b&gt;ArchitectClient&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ name: String&lt;br&gt;+ email: String&lt;br&gt;+ phone: String&lt;br&gt;+ address: Object&lt;br&gt;+ notes: String&lt;br&gt;+ architect: ObjectId&lt;br&gt;+ projects: ObjectId[]&lt;br&gt;+ isActive: Boolean&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;" parent="1" vertex="1">
      <mxGeometry x="40" y="500" width="180" height="140" as="geometry" />
    </mxCell>
    
    <!-- Project -->
    <mxCell id="project" value="&lt;p style=&quot;margin:0px;margin-top:4px;text-align:center;&quot;&gt;&lt;b&gt;Project&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ clientId: ObjectId&lt;br&gt;+ architectId: ObjectId&lt;br&gt;+ title: String&lt;br&gt;+ description: String&lt;br&gt;+ category: String&lt;br&gt;+ status: String {pending, in_progress, completed, canceled}&lt;br&gt;+ budget: Number&lt;br&gt;+ startDate: Date&lt;br&gt;+ endDate: Date&lt;br&gt;+ coverImage: String&lt;br&gt;+ progressPercentage: Number&lt;br&gt;+ paymentStatus: String&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;" parent="1" vertex="1">
      <mxGeometry x="300" y="500" width="220" height="200" as="geometry" />
    </mxCell>
    
    <!-- Quote -->
    <mxCell id="quote" value="&lt;p style=&quot;margin:0px;margin-top:4px;text-align:center;&quot;&gt;&lt;b&gt;Quote&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ client: ObjectId&lt;br&gt;+ architect: ObjectId&lt;br&gt;+ project: ObjectId&lt;br&gt;+ projectTitle: String&lt;br&gt;+ items: Object[]&lt;br&gt;+ subtotal: Number&lt;br&gt;+ totalAmount: Number&lt;br&gt;+ issueDate: Date&lt;br&gt;+ expirationDate: Date&lt;br&gt;+ status: String {draft, sent, accepted, rejected}&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;" parent="1" vertex="1">
      <mxGeometry x="580" y="500" width="220" height="160" as="geometry" />
    </mxCell>
    
    <!-- Task -->
    <mxCell id="task" value="&lt;p style=&quot;margin:0px;margin-top:4px;text-align:center;&quot;&gt;&lt;b&gt;Task&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ architect: ObjectId&lt;br&gt;+ title: String&lt;br&gt;+ description: String&lt;br&gt;+ status: String {todo, in-progress, done}&lt;br&gt;+ dueDate: Date&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;" parent="1" vertex="1">
      <mxGeometry x="40" y="720" width="180" height="100" as="geometry" />
    </mxCell>
    
    <!-- Event -->
    <mxCell id="event" value="&lt;p style=&quot;margin:0px;margin-top:4px;text-align:center;&quot;&gt;&lt;b&gt;Event&lt;/b&gt;&lt;/p&gt;&lt;hr size=&quot;1&quot;&gt;&lt;p style=&quot;margin:0px;margin-left:4px;&quot;&gt;+ title: String&lt;br&gt;+ description: String&lt;br&gt;+ date: Date&lt;br&gt;+ location: String&lt;br&gt;+ createdBy: ObjectId&lt;/p&gt;" style="verticalAlign=top;align=left;overflow=fill;fontSize=12;fontFamily=Helvetica;html=1;" parent="1" vertex="1">
      <mxGeometry x="300" y="720" width="180" height="100" as="geometry" />
    </mxCell>
    
    <!-- Flèches d'héritage -->
    <mxCell id="inherit1" value="" style="endArrow=block;endSize=16;endFill=0;html=1;entryX=0.5;entryY=1;entryDx=0;entryDy=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;" parent="1" source="architect" target="user" edge="1">
      <mxGeometry width="160" relative="1" as="geometry">
        <mxPoint x="330" y="400" as="sourcePoint" />
        <mxPoint x="490" y="400" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    
    <mxCell id="inherit2" value="" style="endArrow=block;endSize=16;endFill=0;html=1;entryX=0.5;entryY=1;entryDx=0;entryDy=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;" parent="1" source="client" target="user" edge="1">
      <mxGeometry width="160" relative="1" as="geometry">
        <mxPoint x="330" y="400" as="sourcePoint" />
        <mxPoint x="490" y="400" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    
    <!-- Relations -->
    <mxCell id="rel1" value="1" style="endArrow=none;html=1;endSize=12;startArrow=none;startSize=0;startFill=0;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=bottom;entryX=0.5;entryY=0;entryDx=0;entryDy=0;exitX=0.5;exitY=1;exitDx=0;exitDy=0;" parent="1" source="architect" target="architectClient" edge="1">
      <mxGeometry x="-1" y="3" relative="1" as="geometry">
        <mxPoint x="330" y="400" as="sourcePoint" />
        <mxPoint x="490" y="400" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    
    <mxCell id="rel1label" value="*" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;" parent="1" vertex="1">
      <mxGeometry x="120" y="480" width="20" height="20" as="geometry" />
    </mxCell>
    
    <mxCell id="rel2" value="" style="endArrow=none;html=1;endSize=12;startArrow=none;startSize=0;startFill=0;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=bottom;entryX=0;entryY=0.5;entryDx=0;entryDy=0;exitX=1;exitY=0.5;exitDx=0;exitDy=0;" parent="1" source="architectClient" target="project" edge="1">
      <mxGeometry x="-1" y="3" relative="1" as="geometry">
        <mxPoint x="330" y="400" as="sourcePoint" />
        <mxPoint x="490" y="400" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    
    <mxCell id="rel3" value="" style="endArrow=none;html=1;endSize=12;startArrow=none;startSize=0;startFill=0;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=bottom;entryX=0;entryY=0.5;entryDx=0;entryDy=0;exitX=1;exitY=0.5;exitDx=0;exitDy=0;" parent="1" source="project" target="quote" edge="1">
      <mxGeometry x="-1" y="3" relative="1" as="geometry">
        <mxPoint x="330" y="400" as="sourcePoint" />
        <mxPoint x="490" y="400" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    
    <mxCell id="rel4" value="" style="endArrow=none;html=1;endSize=12;startArrow=none;startSize=0;startFill=0;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=bottom;entryX=0.5;entryY=0;entryDx=0;entryDy=0;exitX=0;exitY=1;exitDx=0;exitDy=0;" parent="1" source="architect" target="task" edge="1">
      <mxGeometry x="-1" y="3" relative="1" as="geometry">
        <mxPoint x="330" y="400" as="sourcePoint" />
        <mxPoint x="490" y="400" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    
    <mxCell id="rel5" value="" style="endArrow=none;html=1;endSize=12;startArrow=none;startSize=0;startFill=0;edgeStyle=orthogonalEdgeStyle;align=left;verticalAlign=bottom;entryX=0.5;entryY=0;entryDx=0;entryDy=0;exitX=0.5;exitY=1;exitDx=0;exitDy=0;" parent="1" source="project" target="event" edge="1">
      <mxGeometry x="-1" y="3" relative="1" as="geometry">
        <mxPoint x="330" y="400" as="sourcePoint" />
        <mxPoint x="490" y="400" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    
    <!-- Labels de cardinalité -->
    <mxCell id="card1" value="owns" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" parent="1" vertex="1">
      <mxGeometry x="180" y="460" width="30" height="20" as="geometry" />
    </mxCell>
    
    <mxCell id="card2" value="1..*" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" parent="1" vertex="1">
      <mxGeometry x="270" y="580" width="30" height="20" as="geometry" />
    </mxCell>
    
    <mxCell id="card3" value="1..*" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];" parent="1" vertex="1">
      <mxGeometry x="550" y="580" width="30" height="20" as="geometry" />
    </mxCell>
    
  </root>
</mxGraphModel>
